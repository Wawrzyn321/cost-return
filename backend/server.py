import flask
import pocketbase.models
from flask_cors import CORS
from pocketbase import PocketBase
import requests
import os
import jwt
import uuid
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

PORT = int(os.getenv('PORT') or '60055')
ENV = (os.getenv('ENV') or 'DEV').upper()
REMOTE_ADDRESS = os.environ['REMOTE_ADDRESS']
EMAIL = os.environ['EMAIL']
PASSWORD = os.environ['PASSWORD']
ADMIN_TOKEN_LIFETIME_S = int(os.getenv('ADMIN_TOKEN_LIFETIME_S') or 60 * 60 * 24)
SERVER_SECRET = os.environ['SERVER_SECRET']

pocketbase_admin_client = PocketBase(REMOTE_ADDRESS)
pocketbase_user_client = PocketBase(REMOTE_ADDRESS)

last_admin_login_unix = None


def ensure_admin_login():
    global last_admin_login_unix

    if not last_admin_login_unix:
        pocketbase_admin_client.admins.auth_via_email(EMAIL, PASSWORD)
        last_admin_login_unix = int(time.time())
    else:
        if time.time() - last_admin_login_unix > ADMIN_TOKEN_LIFETIME_S * 0.9:
            pocketbase_admin_client.admins.auth_via_email(EMAIL, PASSWORD)
            last_admin_login_unix = int(time.time())


def validate_token(token):
    try:
        alg = jwt.get_unverified_header(token)['alg']

        domain = 'https://dev-cbdrgzv1.us.auth0.com'
        jwks_url = domain + '/.well-known/jwks.json'
        issuer = domain + '/'
        audience = "cost-return-api"

        jwks_client = jwt.PyJWKClient(jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        profile = jwt.decode(
            token,
            signing_key.key,
            algorithms=[alg],
            issuer=issuer,
            audience=audience
        )
        return True, profile['sub'].replace('google-oauth2|', ''), None
    except jwt.DecodeError as e:
        print('jwt.DecodeError', e)
        return False, None, 400
    except jwt.InvalidTokenError as e:
        print('jwt.InvalidTokenError', e)
        return False, None, 403
    except Exception as e:
        print(e)
        return False, None, 401


app = flask.Flask(__name__)
CORS(app, supports_credentials=True)


@app.before_request
def handle_preflight():
    if flask.request.method == "OPTIONS":
        return flask.Response('', status=200)

def handle_login(profile):
    ensure_admin_login()

    def user_exists(possible_user_email):
        return possible_user_email in [u.email for u in pocketbase_admin_client.users.get_full_list()]

    def make_login_data(user_id):
        generated_email = user_id + '@cost-return.oto-jest-wawrzyn.pl'
        generated_password = uuid.uuid3(uuid.NAMESPACE_DNS, user_id + SERVER_SECRET)
        return generated_email, str(generated_password)

    email, password = make_login_data(profile)

    if not user_exists(email):
        u = pocketbase_admin_client.users.create({
            'email': email,
            'password': password,
            'passwordConfirm': password
        })

        starter_collection = {
            'name': 'An item I have to pay of',
            'startingAmount': 59.99,
            'user': u.profile.id
        }
        collection = pocketbase_admin_client.records.create('collections', starter_collection)

        starter_collection_entry = {
            'comment': 'My first payment!',
            'amount': 10,
            'collectionId': collection.id
        }
        pocketbase_admin_client.records.create('collectionEntries', starter_collection_entry)

    login_response = pocketbase_user_client.users.auth_via_email(email, password)
    data = {
        'token': login_response.token,
        'userId': login_response.user.id,
        'profileId': login_response.user.profile.id
    }
    return data, 200

def proxy_request(path):
    url = REMOTE_ADDRESS + "/" + path + "?" + flask.request.query_string.decode("utf-8")
    headers = {}

    pb_token = flask.request.headers.get('X-Cost-Return-PB-Token')
    headers['Authorization'] = f'User {pb_token}'

    content_type = flask.request.headers.get('Content-Type')
    if content_type:
        headers['Content-Type'] = content_type

    try:
        session = requests.Session()
        retry = Retry(connect=3, backoff_factor=0.5)
        adapter = HTTPAdapter(max_retries=retry)
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        result = session.request(flask.request.method,
                                 url,
                                 data=flask.request.get_data(),
                                 headers=headers, verify=False)
        return result.content, result.status_code
    except Exception as e:
        print(e)
        return 'Request error', 400

@app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'DELETE', 'OPTIONS'])
@app.route('/<path:path>', methods=['GET', 'POST', 'DELETE', 'OPTIONS'])
def index(path=''):
    token = (flask.request.headers.get('Authorization') or '').replace('Bearer ', '')
    token_valid, profile, error_status = validate_token(token)
    if not token_valid:
        return '', error_status

    if path == 'login':
        try:
            return handle_login(profile)
        except pocketbase.ClientResponseError as e:
            return e.data or 'unknown error', e.status
    else:
        return proxy_request(path)


print('Starting the', ENV, ' server on ', PORT)
if ENV == 'PRODUCTION':
    print('PROD')
    from waitress import serve

    serve(app, port=PORT, host='0.0.0.0', url_scheme='https')
else:
    app.run(port=PORT, debug=True)

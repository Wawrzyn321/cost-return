import flask
from flask_cors import CORS
from pocketbase import PocketBase
import requests
import os
from werkzeug.routing import Rule
import jwt
import json

ALLOWED_PROFILES = [{
    'googleId': 'google-oauth2|114938617275240442581',
    'nickname': 'Wawrzyn'
}]

PORT = int(os.getenv('PORT') or '60055')
ENV = (os.getenv('ENV') or 'DEV').upper()
REMOTE_ADDRESS = os.environ['REMOTE_ADDRESS']
EMAIL = os.environ['EMAIL']
PASSWORD = os.environ['PASSWORD']

pocketbase_client = PocketBase(REMOTE_ADDRESS)

def validate_token(token):
    try:
        alg = jwt.get_unverified_header(token)['alg']

        DOMAIN = 'https://dev-cbdrgzv1.us.auth0.com'
        JWKS_URL = DOMAIN + '/.well-known/jwks.json'
        ISSUER = DOMAIN + '/'
        AUDIENCE = "cost-return-api"

        jwks_client = jwt.PyJWKClient(JWKS_URL)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        profile = jwt.decode(
            token,
            signing_key.key,
            algorithms=[alg],
            issuer=ISSUER,
            audience=AUDIENCE
            )

        if not list(filter(lambda p: p['googleId'] == profile['sub'], ALLOWED_PROFILES)):
            return (False, 403)
        return (True, None)
    except jwt.DecodeError as e:
        print('jwt.DecodeError', e)
        return (False, 400)
    except jwt.InvalidTokenError as e:
        print('jwt.InvalidTokenError', e)
        return (False, 403)
    except Exception as e:
        print(e)
        return (False, 401)

def get_admin_token():
    admin_data = pocketbase_client.admins.auth_via_email(EMAIL, PASSWORD)
    return admin_data.token


def make_headers(flaskheaders):
    headers = {}
    for k, v in flaskheaders:
        headers[k] = v
    
    headers['Authorization'] = 'Admin ' + get_admin_token()

    return headers

def seed_db():
    for profile in ALLOWED_PROFILES:
        result = requests.request('GET',
                REMOTE_ADDRESS +"/api/collections/users/records/?filter=(googleId='"+profile['googleId']+"')",
                headers=make_headers(dict()))
        if len(json.loads(result.content)['items']) == 0:
            result = requests.request('POST',
                REMOTE_ADDRESS +"/api/collections/users/records",
                json=profile,
                headers=make_headers(dict()))
            print('PUT', profile['googleId'])
        else:
            print(profile['googleId'], 'is present')

app = flask.Flask(__name__)
app.url_map.add(Rule('/', endpoint='index'))
app.url_map.add(Rule('/<path:path>', endpoint='index'))
CORS(app, supports_credentials=True)

seed_db()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path=''):
    if flask.request.method == 'OPTIONS':
        return '', 200

    token = flask.request.headers.get('Authorization')
    token_valid, error_status = validate_token(token)
    if not token_valid:
        return '', error_status

    try:
        result = requests.request(flask.request.method,
            REMOTE_ADDRESS +"/"+ path,
            data=flask.request.get_data(),
            headers=make_headers(flask.request.headers))
        return result.content, result.status_code
    except Exception as e:
        print(e)
        return 'BRZYDKO', 400


print('Starting the', ENV, ' server on ', PORT)

if ENV == 'PRODUCTION':
    print('PROD')
    from waitress import serve
    serve(app, port=PORT, host='0.0.0.0', url_scheme='https')
else:
    app.run(port=PORT)

import flask
from flask_cors import CORS
from pocketbase import PocketBase
import requests
import os
from werkzeug.routing import Rule
import jwt

ALLOWED_PROFILES = ['google-oauth2|114938617275240442581']

PORT = int(os.getenv('PORT') or '60055')
ENV = (os.getenv('ENV') or 'DEV').upper()
REMOTE_ADDRESS = os.environ['REMOTE_ADDRESS']
EMAIL = os.environ['EMAIL']
PASSWORD = os.environ['PASSWORD']

def validate_token(token):
    print(token)
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

        if not profile.sub in ALLOWED_PROFILES:
            return (false, 403)
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

def make_headers(flaskheaders):
        client = PocketBase(REMOTE_ADDRESS)
        admin_data = client.admins.auth_via_email(EMAIL, PASSWORD)

        headers = {}

        for k, v in flaskheaders:
            headers[k] = v
        headers['Authorization'] = 'Admin ' + admin_data.token

        return headers

app = flask.Flask(__name__)
app.url_map.add(Rule('/', endpoint='index'))
app.url_map.add(Rule('/<path:path>', endpoint='index'))
CORS(app)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):

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
    serve(app, port=PORT)
else:
    app.run(port=PORT)

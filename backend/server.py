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
ADMIN_TOKEN_LIFETIME_S = int(os.getenv('ADMIN_TOKEN_LIFETIME_S') or 60*60*24)

pocketbase_client = PocketBase(REMOTE_ADDRESS)

last_admin_login_unix = None
def ensure_admin_login():
    global last_admin_login_unix
    if not last_admin_login_unix:
        pocketbase_client.admins.auth_via_email(EMAIL, PASSWORD)
        last_admin_login_unix = int(time.time())
    else:
        if time.time() - last_admin_login_unix > ADMIN_TOKEN_LIFETIME_S * 0.9:
            pocketbase_client.admins.auth_via_email(EMAIL, PASSWORD)
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
CORS(app, supports_credentials=True,)
    
@app.route('/collections', methods=['GET', 'OPTIONS'])
def user_collections():
    if flask.request.method == 'OPTIONS':
        return '', 200


    token = flask.request.headers.get('Authorization')
    token_valid, g_user_id, error_status = validate_token(token)
    if not token_valid:
        return '', error_status

    # pbToken = flask.request.headers.get('X-PB-Authorization')
    # # url = REMOTE_ADDRESS +f"/api/collections/collections/records?expand=entries"
    # url = REMOTE_ADDRESS + f"/api/collections/collections/records?filter=(gUserId='{g_user_id}')&expand=entries"
    # print(flask.request.method, url)
    # headers = {'Authorization': pbToken}
    # try:
    #     session = requests.Session()
    #     retry = Retry(connect=3, backoff_factor=0.5)
    #     adapter = HTTPAdapter(max_retries=retry)
    #     session.mount('http://', adapter)
    #     session.mount('https://', adapter)
    #     result = session.request(flask.request.method,
    #                              url,
    #                              data=flask.request.get_data(),
    #                              headers=headers, verify=False)
    #     return result.content, result.status_code
    try:
        ensure_admin_login()
        return [r.__dict__ for r in pocketbase_client.records.get_full_list('collections')], 200
    except Exception as e:
        print(e)
        return 'BRZYDKO', 400


# @app.route('/', defaults={'path': ''})
# @app.route('/<path:path>')
# def index(path=''):
#     if flask.request.method == 'OPTIONS':
#         return '', 200

#     token = flask.request.headers.get('Authorization')
#     token_valid, error_status = validate_token(token)
#     if not token_valid:
#         return '', error_status


#     url = REMOTE_ADDRESS +"/"+ path# + '?filter=(='abc')'
#     print(flask.request.method, url)
#     headers = make_headers()
#     try:
#         session = requests.Session()
#         retry = Retry(connect=3, backoff_factor=0.5)
#         adapter = HTTPAdapter(max_retries=retry)
#         session.mount('http://', adapter)
#         session.mount('https://', adapter)
#         result = session.request(flask.request.method,
#             url,
#             data=flask.request.get_data(),
#             headers=headers,verify=False)
#         return result.content, result.status_code
#     except Exception as e:
#         print(e)
#         return 'BRZYDKO', 400


print('Starting the', ENV, ' server on ', PORT)
if ENV == 'PRODUCTION':
    print('PROD')
    from waitress import serve

    serve(app, port=PORT, host='0.0.0.0', url_scheme='https')
else:
    app.run(port=PORT, debug=True)

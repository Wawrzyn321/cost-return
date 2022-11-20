import flask
import jwt

DOMAIN = 'https://dev-cbdrgzv1.us.auth0.com'
JWKS_URL = DOMAIN + '/.well-known/jwks.json'
ISSUER = DOMAIN + '/'
AUDIENCE = "cost-return-api"

jwks_client = jwt.PyJWKClient(JWKS_URL)
def validate_token(token):
    try:
        alg = jwt.get_unverified_header(token)['alg']

        signing_key = jwks_client.get_signing_key_from_jwt(token)

        profile = jwt.decode(
            token,
            signing_key.key,
            algorithms=[alg],
            issuer=ISSUER,
            audience=AUDIENCE
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

def app_auth_hook():
    token = (flask.request.headers.get('Authorization') or '').replace('Bearer ', '')
    token_valid, profile, error_status = validate_token(token)
    if not token_valid:
        return '', error_status
    flask.g.profile = profile

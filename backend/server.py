import flask
from flask_cors import CORS
import os
from before_request_hooks.preflight_hook import preflight_hook
from before_request_hooks.app_auth_hook import app_auth_hook
from request_handlers.handle_proxy_request import handle_proxy_request
from request_handlers.handle_login import handle_login
from request_handlers.handle_shared import handle_shared

PORT = int(os.getenv('PORT') or '60055')
ENV = (os.getenv('ENV') or 'DEV').upper()

app = flask.Flask(__name__)
CORS(app, supports_credentials=True)

@app.before_request
def handle_preflight():
    return preflight_hook()

@app.before_request
def handle_app_auth():
    # todo use decorator
    if not flask.request.path.startswith('/shared'):
        return app_auth_hook()

@app.route('/shared/<collection_id>', methods=['GET'])
def shared_route(collection_id):
    return handle_shared(collection_id)

@app.route('/login', methods=['POST'])
def login_route():
    return handle_login()

@app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'DELETE', 'PATCH'])
@app.route('/<path:path>', methods=['GET', 'POST', 'DELETE', 'PATCH'])
def proxy_route(path=''):
    return handle_proxy_request(path)


print('Starting the', ENV, ' server on ', PORT)
if ENV == 'PRODUCTION':
    from waitress import serve
    serve(app, port=PORT, host='0.0.0.0', url_scheme='https')
else:
    app.run(port=PORT, debug=True)

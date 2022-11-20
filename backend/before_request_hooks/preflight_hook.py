import flask

def preflight_hook():
    if flask.request.method == "OPTIONS":
        return flask.Response('', status=200)
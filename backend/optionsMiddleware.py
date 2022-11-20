from werkzeug.wrappers import Request, Response, ResponseStream

class OptionsMiddleware:
    def __init__(self, app):
        self.app = app
        print('inited middleware')

    def __call__(self, environ, start_response):
        request = Request(environ)
        print('call!', request.method, request.authorization)

        if request.method == 'OPTIONS':
            print(start_response.__dict__)
            res = Response(u'', status=200)
            return res(environ, start_response)
        return self.app(environ, start_response)


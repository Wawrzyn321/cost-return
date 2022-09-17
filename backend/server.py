import socket as socketLib
import ssl
import requests
import os
from urllib import parse

# try to import C parser then fallback in pure python parser.
try:
    from http_parser.parser import HttpParser
except ImportError:
    from http_parser.pyparser import HttpParser
import json


PORT = int(os.getenv('PORT') or '60055')
ADDRESS = os.getenv('ADDRESS') or '0.0.0.0'
ENV = (os.getenv('ENV') or 'DEV').upper()
REMOTE_ADDRESS = os.environ['REMOTE_ADDRESS']

print('Starting the', ENV, ' server on ', ADDRESS,':',PORT)

def handleRequest(socket):
    while True:
        client_connection, client_address = socket.accept()

        # # Get the client request
        # request = client_connection.recv(2048).decode()
        # splitLines = [line for line in request.split('\r\n')]
        # [protocolHeader, *headers, _, body] = splitLines
        # print('PROTOCOL:', protocolHeader)
        # method = protocolHeader[:protocolHeader.index(' ')]
        # print('METHOD', method)
        # hasBody = bool(body)
        # print('HEADERS', headers)
        # print('HAS BODY', hasBody)
        # if (hasBody):
        #     print('BODY', body)

        body = []
        p = HttpParser()
        while True:
            data = client_connection.recv(1024)
            if not data:
                break

            recved = len(data)
            assert p.execute(data, recved) == recved

            if p.is_partial_body():
                body.append(str(p.recv_body()))

            if p.is_message_complete():
                break

        # if body:
        #     body = ''.join(body)
        #     body = body[2:len(body)-1]
        #     try:
        #         body = json.loads(body)
        #         print('BODY', body)
        #     except Exception as e:
        #         print(e)
        #         print(body)
        # print('HEADERS', p.get_headers())

        # print('VERSION', p.get_version())
        # print('STATUS', p.get_status_code())
        # print('URL', p.get_url())
        # print('PATH', p.get_path())
        # print('QS', p.get_query_string())

        # Send HTTP response

        params = parse.parse_qs(parse.urlsplit(p.get_url()).query)
        result = requests.request(p.get_method(), REMOTE_ADDRESS + p.get_path(), params=params, data=data, headers=p.get_headers())

        # print('body len', len(body))
    
        print(REMOTE_ADDRESS + p.get_path())
        response = ['HTTP/1.0 {} {}\r\n'.format(result.status_code, result.reason)]

        for key, value in result.headers.items():
            if key == 'Content-Length':
                print('cnt', value)
            response.append('{}: {}\r\n'.format(key, value))

        # print(response)


        if (body):
            response.append('\r\n')
            response.append(json.dumps(body))
        else:
            response.append('\r\n\r\n')
            

        # print('TOTAL', len("".join(response)), len("".join(response).encode()))
        response = "".join(response).encode()
        client_connection.sendall(response)

        client_connection.close()


context = None
if ENV == 'PROD':
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain('/etc/letsencrypt/live/oto-jest-wawrzyn.pl/fullchain.pem', '/etc/letsencrypt/live/oto-jest-wawrzyn.pl/privkey.pem')

with socketLib.socket(socketLib.AF_INET, socketLib.SOCK_STREAM, 0) as socket:
    socket.bind((ADDRESS, PORT))
    socket.listen(5)

    if ENV == 'PROD':
        with context.wrap_socket(socket, server_side=True) as secure_socket:
            handleRequest(secure_socket)
    else:
        handleRequest(socket)

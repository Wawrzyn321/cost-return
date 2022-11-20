import flask
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import os

REMOTE_ADDRESS = os.environ['REMOTE_ADDRESS']

def handle_proxy_request(path):
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

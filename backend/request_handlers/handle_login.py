import flask
import pocketbase.models
from pocketbase import PocketBase
import uuid
import time
import os

EMAIL = os.environ['EMAIL']
PASSWORD = os.environ['PASSWORD']
ADMIN_TOKEN_LIFETIME_S = int(os.getenv('ADMIN_TOKEN_LIFETIME_S') or 60 * 60 * 24)
SERVER_SECRET = os.environ['SERVER_SECRET']
REMOTE_ADDRESS = os.environ['REMOTE_ADDRESS']

last_admin_login_unix = None

pocketbase_admin_client = PocketBase(REMOTE_ADDRESS)
pocketbase_user_client = PocketBase(REMOTE_ADDRESS)

def ensure_admin_login():
    global last_admin_login_unix

    if not last_admin_login_unix:
        pocketbase_admin_client.admins.auth_via_email(EMAIL, PASSWORD)
        last_admin_login_unix = int(time.time())
    else:
        if time.time() - last_admin_login_unix > ADMIN_TOKEN_LIFETIME_S * 0.9:
            pocketbase_admin_client.admins.auth_via_email(EMAIL, PASSWORD)
            last_admin_login_unix = int(time.time())


def login(profile):
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


def handle_login():
    try:
        return login(flask.g.profile)
    except pocketbase.ClientResponseError as e:
        return e.data or 'unknown error', e.status
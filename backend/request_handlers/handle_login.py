import flask
import pocketbase.models
from pocketbase import PocketBase
import uuid
import os
from .pocketbase_admin_client import get_pocketbase_admin_client

SERVER_SECRET = os.environ['SERVER_SECRET']
REMOTE_ADDRESS = os.environ['REMOTE_ADDRESS']

pocketbase_user_client = PocketBase(REMOTE_ADDRESS)

def make_login_data(user_id):
    generated_email = user_id + '@cost-return.oto-jest-wawrzyn.pl'
    generated_password = uuid.uuid3(uuid.NAMESPACE_DNS, user_id + SERVER_SECRET)
    return generated_email, str(generated_password)

def user_exists(client, email):
    return email in [user.email for user in client.users.get_full_list()]

def create_and_seed_user(client, email, password):
    user = client.users.create({
        'email': email,
        'password': password,
        'passwordConfirm': password
    })

    starter_collection = {
        'name': 'An item I have to pay of',
        'startingAmount': 59.99,
        'user': user.profile.id
    }
    collection = client.records.create('collections', starter_collection)

    starter_collection_entry = {
        'comment': 'My first payment!',
        'amount': 10,
        'collectionId': collection.id
    }
    client.records.create('collectionEntries', starter_collection_entry)

def login(profile):
    email, password = make_login_data(profile)

    pocketbase_admin_client = get_pocketbase_admin_client()
    if not user_exists(pocketbase_admin_client, email):
        create_and_seed_user(pocketbase_admin_client, email, password)

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
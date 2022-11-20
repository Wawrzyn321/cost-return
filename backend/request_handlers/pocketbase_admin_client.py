from pocketbase import PocketBase
import time
import os

EMAIL = os.environ['EMAIL']
PASSWORD = os.environ['PASSWORD']
ADMIN_TOKEN_LIFETIME_S = int(os.getenv('ADMIN_TOKEN_LIFETIME_S') or 60 * 60 * 24)
SERVER_SECRET = os.environ['SERVER_SECRET']
REMOTE_ADDRESS = os.environ['REMOTE_ADDRESS']
pocketbase_admin_client = PocketBase(REMOTE_ADDRESS)

last_admin_login_unix = None

def ensure_admin_login():
    global last_admin_login_unix

    if not last_admin_login_unix:
        pocketbase_admin_client.admins.auth_via_email(EMAIL, PASSWORD)
        last_admin_login_unix = int(time.time())
    else:
        if time.time() - last_admin_login_unix > ADMIN_TOKEN_LIFETIME_S * 0.9:
            pocketbase_admin_client.admins.auth_via_email(EMAIL, PASSWORD)
            last_admin_login_unix = int(time.time())

def get_pocketbase_admin_client():
    ensure_admin_login()
    return pocketbase_admin_client
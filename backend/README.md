# cost-return backend

## Requirements

- Python3 (3.10.8)

## Installation & running the project

```bash
    pip install -r requirements.txt
    python3 server.py
```

Required envs:
- REMOTE_ADDRESS - the proxy target, should point to a Pocketbase instance.
- EMAIL - Pocketbase admin e-mail
- PASSWORD - Pocketbase admin password
- SERVER_SECRET - secret used for generating random passwords

## Endpoints

- `/login` - used for login
- `/shared/:collectionId` - used for getting shared collections
- `/*/` - proxy to PB server. Required authentication.

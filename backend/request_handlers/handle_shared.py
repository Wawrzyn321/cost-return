import pocketbase
from .pocketbase_admin_client import get_pocketbase_admin_client


def handle_shared(collection_id):
    pocketbase_admin_client = get_pocketbase_admin_client()

    try:
        collection = pocketbase_admin_client.records.get_one('collections', collection_id)
        if not collection.shared:
            return '', 404

        entries = pocketbase_admin_client.records.get_list('collectionEntries', 1, 20, {
            "filter": 'collectionId = "' + collection_id + '"'
        })
        entries = [{
            'amount': entry.amount,
            'comment': entry.comment,
            'created': entry.created,
        } for entry in entries.items]
        return {
            'name': collection.name,
            'startingAmount': collection.starting_amount,
            'created': collection.created,
            'entries': entries
        }
    except pocketbase.ClientResponseError as e:
        return e.data or 'unknown error', e.status

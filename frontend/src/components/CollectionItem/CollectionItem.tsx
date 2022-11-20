import { AsyncStatus, Collection, CollectionEntry } from '../../api/types';
import { createSignal, For, Show } from 'solid-js';
import { NewEntryForm } from './NewEntryForm';
import { useApiContext } from '../../api/ApiContext';
import { BsExclamationCircle, BsTrash } from 'solid-icons/bs';
import { Entry } from './Entry/Entry';
import {
  BsHourglassSplit,
  BsClipboard2CheckFill,
  BsClipboardXFill,
} from 'solid-icons/bs';
import { PaidBadge } from './PaidBadge/PaidBadge';
import { ProgressBar } from './Entry/PogressBar/ProgressBar';
import { SharingForm } from './SharingForm';

type CollectionItemProps = {
  collection: Collection;
  onEntryAdd: (entry: CollectionEntry) => void;
  onEntryDelete: (entryId: string) => void;
  onCollectionUpdate: (entry: Collection) => void;
  onCollectionDelete: (collectionId: string) => void;
  entries: CollectionEntry[];
};

export function CollectionItem(props: CollectionItemProps) {
  const api = useApiContext()!;
  const [deleteStatus, setDeleteStatus] = createSignal<AsyncStatus>('none');

  const amountPaid = () =>
    Math.min(
      props.collection.startingAmount,
      props.entries.reduce((acc, curr) => acc + curr.amount, 0),
    );

  const entriesCount = () => props.entries.length;

  const deleteCollection = async () => {
    setDeleteStatus('pending');
    const { id } = props.collection;
    const response = await api()!.collections.deleteOne(id);
    if (response instanceof Error) {
      setDeleteStatus(response);
    } else {
      props.onCollectionDelete(id);
    }
  };

  const isDeletePending = () => deleteStatus() === 'pending';

  return (
    <li class="carousel-item block border collection-item">
      <header>
        <h1>
          {props.collection.name}
          <Show when={amountPaid() === props.collection.startingAmount}>
            <PaidBadge />
          </Show>
        </h1>
        <div
          class="grid bg-ng gap-4 place-items-center"
          style={{ 'grid-template-columns': '1fr 1fr' }}
        >
          <p class="text-2xl text-right">
            {amountPaid()}/{props.collection.startingAmount}
          </p>
          <button
            class="btn btn-xs rounded-box h-8 color-text--inverted"
            onClick={deleteCollection}
            disabled={isDeletePending()}
          >
            <div class="flex">
              <Show when={isDeletePending()}>
                <BsHourglassSplit class="swingy" />
              </Show>
              <Show when={deleteStatus() instanceof Error}>
                <div class="tooltip" data-tip={deleteStatus().toString()}>
                  <BsExclamationCircle size={18} />
                </div>
              </Show>
              <BsTrash size={18} />
            </div>
          </button>
        </div>
        <ProgressBar
          value={amountPaid()}
          max={props.collection.startingAmount}
        />
      </header>
      <div class="collapse collapse-arrow border border-base-300 background-page-color rounded-box mt-4">
        <input type="checkbox" />
        <div class="collapse-title text-l font-small">
          Entries ({entriesCount()})
        </div>
        <div class="collapse-content">
          <ul>
            <For each={props.entries}>
              {entry => (
                <Entry entry={entry} onEntryDelete={props.onEntryDelete} />
              )}
            </For>
          </ul>
        </div>
      </div>

      <div class="collapse collapse-arrow border border-base-300 background-page-color rounded-box mt-4">
        <input type="checkbox" />
        <div class="collapse-title text-l font-small">Add new Entry</div>
        <div class="collapse-content">
          <NewEntryForm
            collection={props.collection}
            addEntry={props.onEntryAdd}
          />
        </div>
      </div>

      <div class="collapse collapse-arrow border border-base-300 background-page-color rounded-box mt-4">
        <input type="checkbox" />
        <div class="collapse-title text-l font-small">
          <div class="flex">
            Sharing{' '}
            {props.collection.shared ? (
              <BsClipboard2CheckFill
                size={24}
                class="ml-2 color-text--background"
              />
            ) : (
              <BsClipboardXFill size={24} class="ml-2 color-text--background" />
            )}
          </div>
        </div>
        <div class="collapse-content">
          <SharingForm
            collection={props.collection}
            updateCollection={props.onCollectionUpdate}
          />
        </div>
      </div>
    </li>
  );
}

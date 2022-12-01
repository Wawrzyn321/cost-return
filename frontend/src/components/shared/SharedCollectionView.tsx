import { getPublicCollection } from '../../api/shared/getPublicCollection';
import { createSignal, For, onMount, Show } from 'solid-js';
import { PaidBadge } from '../CollectionItem/PaidBadge/PaidBadge';
import { ProgressBar } from '../CollectionItem/Entry/PogressBar/ProgressBar';
import { PublicCollection } from '../../api/shared/types';
import styles from './SharedCollectionView.module.css';
import { TimeAgo } from '../CollectionItem/Entry/TimeAgo';
import { BsArrowClockwise } from 'solid-icons/bs';

function PublicCollectionDisplaySkeleton() {
  return (
    <div>
      <div
        class={`absolute grid place-content-center ${styles['loading-wrapper']}`}
      >
        <BsArrowClockwise class="opacity-50 loading-spinner" size={70} />
      </div>
      <div class="collection-item ml-auto !mr-auto">
        <header>
          <h1></h1>
          <div
            class="grid bg-ng gap-4 place-items-center"
            style={{ 'grid-template-columns': '1fr 1fr' }}
          >
            <p class="text-2xl text-right"></p>
          </div>
          <ProgressBar value={0} max={1} />
        </header>
        <div class="border border-base-300 background-page-color rounded-box mt-4 p-4">
          <div class="mb-4 text-l font-small"></div>
          <ul>
            <li class={styles['entries-grid']}>
              <span></span>
              <span></span>
              <span></span>
            </li>
            <li class={styles['entries-grid']}>
              <span></span>
              <span></span>
              <span></span>
            </li>
            <li class={styles['entries-grid']}>
              <span></span>
              <span></span>
              <span></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function SharedCollectionView(props: { collectionId: string }) {
  const [collection, setCollection] = createSignal<PublicCollection | null>(
    null,
  );
  const [error, setError] = createSignal<Error | null>(null);

  onMount(async () => {
    try {
      const response = await getPublicCollection(props.collectionId);
      if ('code' in response) {
        throw Error(response.code.toString());
      }
      setCollection(response);
    } catch (e) {
      if (e instanceof Error) {
        console.warn(e);
        setError(e);
      } else {
        throw e;
      }
    }
  });

  const isLoading = () => !error() && !collection();

  return (
    <div class="flex justify-center">
      <Show when={isLoading()}>
        <PublicCollectionDisplaySkeleton />
      </Show>
      <Show when={error()}>ERROR: {error()!.message}</Show>
      <Show when={collection()}>
        <PublicCollectionDisplay collection={collection()!} />
      </Show>
    </div>
  );
}

function PublicCollectionDisplay(props: { collection: PublicCollection }) {
  const amountPaid = () =>
    Math.min(
      props.collection.startingAmount,
      props.collection.entries.reduce((acc, curr) => acc + curr.amount, 0),
    );

  return (
    <div class="collection-item ml-auto !mr-auto">
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
        </div>
        <ProgressBar
          value={amountPaid()}
          max={props.collection.startingAmount}
        />
      </header>
      <div class="border border-base-300 background-page-color rounded-box mt-4 p-4">
        <div class="mb-4 text-l font-small">Entries</div>
        <ul>
          <For each={props.collection.entries}>
            {entry => (
              <li class={styles['entries-grid']}>
                <span>{entry.comment}</span>
                <span>-{entry.amount}</span>
                <span>
                  <TimeAgo timestamp={entry.created} />
                </span>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  );
}

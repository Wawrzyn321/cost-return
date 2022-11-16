import { createEffect, createSignal, Show } from 'solid-js';

import { useApiContext } from './api/ApiContext';
import { ResponseContent } from './api/responseTypes';
import { Collection, CollectionEntry } from './api/types';
import { CollectionsCarousel } from './components/CollectionsCarousel';
import { NewCollectionForm } from './components/NewCollectionForm';
import { OpenFormButton } from './components/OpenFormButton/OpenFormButton';
import { Skeleton } from './Skeleton/Skeleton';

export default function App() {
  const api = useApiContext()!;

  const [collections, setCollections] = createSignal<ResponseContent<
    Collection
  > | null>(null);
  const [
    collectionEntries,
    setCollectionEntries,
  ] = createSignal<ResponseContent<CollectionEntry> | null>(null);
  const [showForm, setShowForm] = createSignal(false);
  let list: HTMLLinkElement | undefined = undefined;

  const [error, setError] = createSignal<Error | null>();

  createEffect(async () => {
    if (!api()) return;

    const fetchCollections = async () => {
      const response = await api()!.collections.getAll();
      if (response instanceof Error) {
        setError(e => e || response);
      } else {
        setCollections(response);
      }
    };

    const fetchCollectionEntries = async () => {
      const response = await api()!.collectionEntries.getAll();
      if (response instanceof Error) {
        setError(e => e || response);
      } else {
        setCollectionEntries(response);
      }
    };

    await Promise.all([fetchCollections(), fetchCollectionEntries()]);
  });

  const switchFormStatus = () => {
    setShowForm(!showForm());
    setTimeout(() => list!.scrollTo(0, 0), 10);
  };

  const dataLoaded = () => !!collections() && !!collectionEntries();

  return (
    <main class="flex overflow-x-auto h-full">
      <Show when={!error()} fallback={<p>{error()!.message}</p>}>
        <Show when={dataLoaded()} fallback={<Skeleton />}>
          <OpenFormButton
            showingForm={showForm()}
            switchStatus={switchFormStatus}
          />
          <ul class="carousel rounded-box" ref={list}>
            <Show when={showForm()}>
              <NewCollectionForm
                hide={switchFormStatus}
                addCollection={collection => {
                  setCollections([collection, ...collections()!]);
                  switchFormStatus();
                }}
              />
            </Show>
            <CollectionsCarousel
              collections={collections()!}
              collectionEntries={collectionEntries()!}
              setCollections={setCollections}
              setCollectionEntries={setCollectionEntries}
            />
          </ul>
        </Show>
      </Show>
    </main>
  );
}

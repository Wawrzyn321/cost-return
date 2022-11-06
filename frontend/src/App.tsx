import { createSignal, For, onMount } from "solid-js";
import styles from "./App.module.css";

import { useApiContext } from "./api/ApiContext";
import { ResponseContent } from "./api/responseTypes";
import { Collection, CollectionEntry } from "./api/types";
import { CollectionItem } from "./components/CollectionItem/CollectionItem";
import { NewCollectionForm } from "./NewCollectionForm";

export default function AuthenticatedPart() {
  const api = useApiContext()!;
  const [collections, setCollections] =
    createSignal<ResponseContent<Collection> | null>(null);
  const [collectionEntries, setCollectionEntries] =
    createSignal<ResponseContent<CollectionEntry> | null>(null);
  const [showForm, setShowForm] = createSignal(false);
  let list: HTMLLinkElement | undefined = undefined;

  const [error, setError] = createSignal<Error | null>();

  const getCollectionEntries = (collection: Collection) => {
    // return (collectionEntries()?.items || []).filter((cE) =>todo
    //   collection.entries.includes(cE.id)
    // );
    return (collectionEntries()?.items || []).filter(
      (cE) => cE.collectionId === collection.id
    );
  };

  const openButtonClass = () =>
    styles["add-new"] +
    " " +
    (showForm() ? styles["add-new--showing-form"] : "");

  onMount(async () => {
    const response = await api.collections.getAll();
    if (response instanceof Error) {
      setError((e) => e || response);
    } else {
      console.log({ collections: response.items });
      setCollections(response);
    }
  });

  onMount(async () => {
    const response = await api.collectionEntries.getAll();
    if (response instanceof Error) {
      setError((e) => e || response);
    } else {
      console.log({ collectionEntries: response.items });
      setCollectionEntries(response);
    }
  });

  const switchStatus = () => {
    setShowForm(!showForm());
    list!.scrollBy(-1000, 0);
  };

  return (
    <main class="flex overflow-x-auto h-full">
      {error() && <p>{error()?.message}</p>}
      {collections() && collectionEntries() && (
        <>
          <button class={openButtonClass()} onClick={switchStatus}>
            <span>+</span>
          </button>
          <ul class="carousel rounded-box" ref={list}>
            {showForm() && (
              <NewCollectionForm
                hide={switchStatus}
                addCollection={(collection) => {
                  setCollections({
                    ...collections()!,
                    items: [collection, ...(collections()?.items || [])],
                  });
                  switchStatus();
                }}
              />
            )}
            <For each={collections()?.items}>
              {(collection) => (
                <CollectionItem
                  collection={collection}
                  entries={getCollectionEntries(collection)}
                  onEntryAdd={(entry) =>
                    setCollectionEntries({
                      ...collectionEntries()!,
                      items: [...collectionEntries()!.items, entry],
                    })
                  }
                  onEntryDelete={(id) => {
                    setCollectionEntries({
                      ...collectionEntries()!,
                      items: collectionEntries()!.items.filter(
                        (item) => item.id !== id
                      ),
                    });
                  }}
                  onCollectionDelete={(id) => {
                    setCollections({
                      ...collections()!,
                      items: collections()!.items.filter(
                        (item) => item.id !== id
                      ),
                    });
                  }}
                />
              )}
            </For>
          </ul>
        </>
      )}
    </main>
  );
}

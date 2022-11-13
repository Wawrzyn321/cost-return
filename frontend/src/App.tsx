import { createEffect, createSignal, For, onMount } from "solid-js";

import { useApiContext } from "./api/ApiContext";
import { ResponseContent } from "./api/responseTypes";
import { Collection, CollectionEntry } from "./api/types";
import { CollectionItem } from "./components/CollectionItem/CollectionItem";
import { NewCollectionForm } from "./components/NewCollectionForm";
import { OpenFormButton } from "./components/OpenFormButton/OpenFormButton";

// function Skeleton() {
//   return (
//     <main class="flex overflow-x-auto h-full">
//       <OpenFormButton skeleton showingForm={false} switchStatus={() => {}} />
//     </main>
//   );
// }

// <>
// {api() ? (
//   <ApiContext.Provider value={api()!}>
//     {props.children}
//   </ApiContext.Provider>
// ) : (
//   <Skeleton />
//   // <div class="flex justify-center items-center">
//   //   <div
//   //     class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
//   //     role="status"
//   //   >
//   //     <span class="visually-hidden">Loading...</span>
//   //   </div>
//   // </div>
// )}
// </>
// );

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
    return (collectionEntries() || []).filter(
      (cE) => cE.collectionId === collection.id
    );
  };

  createEffect(async () => {
    if (!api()) return;

    const fetchCollections = async () => {
      const response = await api()!.collections.getAll();
      if (response instanceof Error) {
        setError((e) => e || response);
      } else {
        setCollections(response);
      }
    };

    const fetchCollectionEntries = async () => {
      const response = await api()!.collectionEntries.getAll();
      if (response instanceof Error) {
        setError((e) => e || response);
      } else {
        setCollectionEntries(response);
      }
    };

    await Promise.all([fetchCollections(), fetchCollectionEntries()]);
  });

  const switchStatus = () => {
    setShowForm(!showForm());
    setTimeout(() => list!.scrollTo(0, 0), 10);
  };

  // todo isDeletePending
  const isLoading = () => !error() && !collections() && !collectionEntries();

  return (
    <main class="flex overflow-x-auto h-full">
      {error() ? (
        <p>{error()?.message}</p>
      ) : (
        <>
          <OpenFormButton
            showingForm={showForm()}
            switchStatus={switchStatus}
            skeleton={isLoading()}
          />
          {collections() && collectionEntries() && (
            <>
              <ul class="carousel rounded-box" ref={list}>
                {showForm() && (
                  <NewCollectionForm
                    hide={switchStatus}
                    addCollection={(collection) => {
                      setCollections([collection, ...collections()!]);
                      switchStatus();
                    }}
                  />
                )}
                <For each={collections()}>
                  {(collection) => (
                    <CollectionItem
                      collection={collection}
                      entries={getCollectionEntries(collection)}
                      onEntryAdd={(entry) =>
                        setCollectionEntries([...collectionEntries()!, entry])
                      }
                      onEntryDelete={(id) => {
                        setCollectionEntries(
                          collectionEntries()!.filter((item) => item.id !== id)
                        );
                      }}
                      onCollectionDelete={(id) => {
                        setCollections(
                          collections()!.filter((item) => item.id !== id)
                        );
                      }}
                    />
                  )}
                </For>
              </ul>
            </>
          )}
        </>
      )}
    </main>
  );
}

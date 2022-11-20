import { For } from 'solid-js';
import { Collection, CollectionEntry } from '../api/types';
import { CollectionItem } from './CollectionItem/CollectionItem';

export function CollectionsCarousel(props: {
  collections: Collection[];
  collectionEntries: CollectionEntry[];
  setCollections: (c: Collection[]) => void;
  setCollectionEntries: (c: CollectionEntry[]) => void;
}) {
  const getCollectionEntries = (collection: Collection) => {
    return props.collectionEntries.filter(
      cE => cE.collectionId === collection.id,
    );
  };

  return (
    <For each={props.collections}>
      {collection => (
        <CollectionItem
          collection={collection}
          entries={getCollectionEntries(collection)}
          onEntryAdd={entry =>
            props.setCollectionEntries([...props.collectionEntries, entry])
          }
          onCollectionUpdate={entry => {
            const index = props.collections.findIndex(e => e.id === entry.id);
            props.collections[index] = entry;
            props.setCollections([...props.collections]);
          }}
          onEntryDelete={id => {
            props.setCollectionEntries(
              props.collectionEntries.filter(item => item.id !== id),
            );
          }}
          onCollectionDelete={id => {
            props.setCollections(
              props.collections.filter(item => item.id !== id),
            );
          }}
        />
      )}
    </For>
  );
}

import sharedStyles from "./../shared.module.css";
import { Collection, CollectionEntry } from "../../api/types";
import { For } from "solid-js";
import styles from "./CollectionItem.module.css";
import { NewEntryForm } from "./NewEntryForm";
import { TimeAgo } from "./TimeAgo";
import { useApiContext } from "../../api/ApiContext";

type CollectionItemProps = {
  collection: Collection;
  onEntryAdd: (entry: CollectionEntry) => void;
  onEntryDelete: (entryId: string) => void;
  onCollectionDelete: (collectionId: string) => void;
  entries: CollectionEntry[];
};

export function CollectionItem(props: CollectionItemProps) {
  const api = useApiContext()!;

  const amountAlreadyTodoChangeName = () =>
    Math.min(
      props.collection.startingAmount,
      props.entries.reduce((acc, curr) => acc + curr.amount, 0)
    );

  const entriesCount = () => props.entries.length;

  const deleteEntry = async (id: string) => {
    const response = await api.collectionEntries.deleteOne(id);
    if (response instanceof Error) {
      console.log(response);
    } else {
      props.onEntryDelete(id);
    }
  };

  const deleteCollection = async () => {
    const { id } = props.collection;
    const response = await api.collections.deleteOne(id);
    if (response instanceof Error) {
      console.log(response);
    } else {
      props.onCollectionDelete(id);
    }
  };

  return (
    <li class={"carousel-item block border " + sharedStyles["collection-item"]}>
      <header>
        <h1>{props.collection.name}</h1>
        <div class="grid gap-4 place-items-center" style={{ "grid-template-columns": "1fr 1fr" }}>
          <p class="text-2xl text-right">
            {amountAlreadyTodoChangeName()}/{props.collection.startingAmount}
          </p>
          <button class="btn bg-bg btn-xs" onClick={deleteCollection}>
            X
          </button>
        </div>
      </header>
      <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mt-4">
        <input type="checkbox" />
        <div class="collapse-title text-l font-small">
          Entries ({entriesCount()})
        </div>
        <div class="collapse-content">
          <ul>
            <For each={props.entries}>
              {(entry) => (
                <li class={styles["entries-grid"]}>
                  <span>{entry.comment}</span>
                  <span>-{entry.amount}</span>
                  <span>
                    <TimeAgo timestamp={entry.created} />
                  </span>
                  <button
                    class="btn bg-bg btn-xs"
                    onClick={() => deleteEntry(entry.id)}
                  >
                    X
                  </button>
                </li>
              )}
            </For>
          </ul>
        </div>
      </div>

      <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mt-4">
        <input type="checkbox" />
        <div class="collapse-title text-l font-small">Add new Entry</div>
        <div class="collapse-content">
          <NewEntryForm
            collection={props.collection}
            addEntry={props.onEntryAdd}
          />
        </div>
      </div>
    </li>
  );
}

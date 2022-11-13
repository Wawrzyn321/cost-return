import sharedStyles from "./../shared.module.css";
import { Collection, CollectionEntry } from "../../api/types";
import { createSignal, For } from "solid-js";
import { NewEntryForm } from "./NewEntryForm";
import { useApiContext } from "../../api/ApiContext";
import { BsExclamationCircle, BsTrash } from "solid-icons/bs";
import { Entry } from "./Entry/Entry";
import { AsyncStatus } from "../errors/AsyncStatus";
import { BsHourglassSplit } from "solid-icons/bs";
import { PaidBadge } from "./PaidBadge/PaidBadge";
import { ProgressBar } from "./Entry/PogressBar/ProgressBar";

type CollectionItemProps = {
  collection: Collection;
  onEntryAdd: (entry: CollectionEntry) => void;
  onEntryDelete: (entryId: string) => void;
  onCollectionDelete: (collectionId: string) => void;
  entries: CollectionEntry[];
};

export function CollectionItem(props: CollectionItemProps) {
  const api = useApiContext()!;
  const [deleteStatus, setDeleteStatus] = createSignal<AsyncStatus>("none");

  const amountPaid = () =>
    Math.min(
      props.collection.startingAmount,
      props.entries.reduce((acc, curr) => acc + curr.amount, 0)
    );

  const entriesCount = () => props.entries.length;

  const deleteCollection = async () => {
    setDeleteStatus("pending");
    const { id } = props.collection;
    const response = await api()!.collections.deleteOne(id);
    if (response instanceof Error) {
      setDeleteStatus(response);
    } else {
      props.onCollectionDelete(id);
    }
  };

  const isDeletePending = () => deleteStatus() === "pending";

  return (
    <li class={"carousel-item block border " + sharedStyles["collection-item"]}>
      <header>
        <h1>
          {props.collection.name}
          {amountPaid() === props.collection.startingAmount && <PaidBadge />}
        </h1>
        <div
          class="grid bg-ng gap-4 place-items-center"
          style={{ "grid-template-columns": "1fr 1fr" }}
        >
          <p class="text-2xl text-right">
            {amountPaid()}/{props.collection.startingAmount}
          </p>
          <button
            class="btn btn-xs rounded-box h-8"
            onClick={deleteCollection}
            disabled={isDeletePending()}
          >
            <div class="flex">
              {isDeletePending() && <BsHourglassSplit class="swingy" />}
              {deleteStatus() instanceof Error && (
                <div class="tooltip" data-tip={deleteStatus().toString()}>
                  <BsExclamationCircle size={18} />
                </div>
              )}
              <BsTrash size={18} />
            </div>
          </button>
        </div>
        <ProgressBar
          value={amountPaid()}
          max={props.collection.startingAmount}
        />
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
                <Entry entry={entry} onEntryDelete={props.onEntryDelete} />
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

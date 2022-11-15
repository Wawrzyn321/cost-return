import { AsyncStatus, CollectionEntry } from "../../../api/types";
import styles from "./Entry.module.css";
import { TimeAgo } from "./TimeAgo";
import { BsTrash, BsHourglassSplit, BsExclamationCircle } from "solid-icons/bs";
import { createSignal, Show } from "solid-js";
import { useApiContext } from "../../../api/ApiContext";

export function Entry(props: {
  entry: CollectionEntry;
  onEntryDelete: (id: string) => void;
}) {
  const [deleteStatus, setDeleteStatus] = createSignal<AsyncStatus>("none");
  const api = useApiContext()!;

  const deleteEntry = async (id: string) => {
    setDeleteStatus("pending");

    const response = await api()!.collectionEntries.deleteOne(id);
    if (response instanceof Error) {
      setDeleteStatus(response);
      response;
    } else {
      props.onEntryDelete(id);
    }
  };

  const isDeletePending = () => deleteStatus() === "pending";

  return (
    <li class={styles["entries-grid"]}>
      <span>{props.entry.comment}</span>
      <span>-{props.entry.amount}</span>
      <span>
        <TimeAgo timestamp={props.entry.created} />
      </span>
      <div
        class={"grid place-content-center " + styles["delete-button-wrapper"]}
      >
        <button
          class="btn bg-bg btn-xs"
          onClick={() => deleteEntry(props.entry.id)}
          disabled={isDeletePending()}
        >
          <div class="flex">
            <Show when={isDeletePending()}>
              <BsHourglassSplit class="swingy" />
            </Show>
            <Show when={deleteStatus() instanceof Error}>
              <div
                class="tooltip tooltip-left"
                data-tip={deleteStatus().toString()}
              >
                <BsExclamationCircle />
              </div>
            </Show>
            <BsTrash />
          </div>
        </button>
      </div>
    </li>
  );
}

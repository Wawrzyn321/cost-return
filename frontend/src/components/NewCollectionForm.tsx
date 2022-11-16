import { createSignal, Show } from "solid-js";
import { useApiContext } from "../api/ApiContext";
import { AsyncStatus, Collection } from "../api/types";
import { useAuthData } from "../auth/AuthDataContext";
import { Alert } from "./Alert";
import { BsHourglassSplit } from "solid-icons/bs";

type NewCollectionFormProps = {
  hide: () => void;
  addCollection: (collection: Collection) => void;
};

export function NewCollectionForm(props: NewCollectionFormProps) {
  let form: HTMLFormElement | undefined = undefined;
  const [formValid, setFormValid] = createSignal(false);
  const [name, setName] = createSignal("");
  const [startingAmount, setStartingAmount] = createSignal(0);
  const [submitStatus, setSubmitStatus] = createSignal<AsyncStatus>("none");
  const api = useApiContext()!;
  const { authData } = useAuthData()!;

  const onInput = () => {
    setFormValid(form?.checkValidity() || false);
  };

  const onSubmit = async () => {
    setSubmitStatus("pending");
    const body = {
      name: name(),
      startingAmount: startingAmount(),
      user: authData()!.pocketbaseProfileId,
    };

    const response = await api()!.collections.createOne(body);
    if (response instanceof Error) {
      setSubmitStatus(response);
    } else {
      props.addCollection(response);
      setSubmitStatus("none");
    }
  };

  const isCreatePending = () => submitStatus() === "pending";

  return (
    <li class="carousel-item block collection-item">
      <header class="flex justify-content-between w-full">
        <h1>Add new Collection</h1>
        <button
          class="btn btn-circle btn-sm background-color--background text-xl ml-auto color-text--inverted"
          onClick={props.hide}
        >
          X
        </button>
      </header>
      <div class="flex flex-col space-between">
        <form class="mt-8" ref={form} onInput={onInput}>
          <label
            class="block text-gray-700 text-sm font-bold mb-2"
            for="collection-name"
          >
            Collection Name
            <input
              value={name()}
              class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              id="collection-name"
              type="text"
              placeholder="Collection Name"
              required
              onChange={(e) => setName((e.target as HTMLInputElement).value)}
            />
          </label>
          <label
            class="block text-gray-700 text-sm font-bold mb-2"
            for="amount"
          >
            Starting Amount
            <input
              value={startingAmount()}
              class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              id="amount"
              type="number"
              min={0.01}
              step={0.01}
              placeholder="Starting Amount"
              required
              onChange={(e) =>
                setStartingAmount((e.target as HTMLInputElement).valueAsNumber)
              }
            />
          </label>
        </form>
        <button
          disabled={!formValid() || isCreatePending()}
          class="btn btn-sm background-color--background color-text--inverted text-xl ml-auto mt-2"
          onClick={onSubmit}
        >
          <Show when={isCreatePending()}>
            <BsHourglassSplit class="swingy" />
          </Show>
          Add
        </button>
        <Show when={submitStatus() instanceof Error}>
          <Alert message={submitStatus().toString()} />
        </Show>
      </div>
    </li>
  );
}

import { createSignal } from "solid-js";
import { useApiContext } from "./api/ApiContext";
import { Collection } from "./api/types";
import { useAuthData } from "./auth/AuthDataContext";
import sharedStyles from "./components/shared.module.css";

type NewCollectionFormProps = {
  hide: () => void;
  addCollection: (collection: Collection) => void;
};

// function Input({name, value, onChange, ...props}) todo ale z ładnymi mergeProps i splitProps z solida

export function NewCollectionForm(props: NewCollectionFormProps) {
  let form: HTMLFormElement | undefined = undefined;
  const [formValid, setFormValid] = createSignal(false);
  const [name, setName] = createSignal("");
  const [startingAmount, setStartingAmount] = createSignal(0);
  const api = useApiContext()!;
  const { authData } = useAuthData()!;

  const onInput = () => {
    setFormValid(form?.checkValidity() || false);
  };

  const onSubmit = async () => {
    const body = {
      name: name(),
      startingAmount: startingAmount(),
      user: authData()!.pocketbaseProfileId,
    };

    const response = await api.collections.createOne(body);
    if (response instanceof Error) {
      console.log(response);
    } else {
      props.addCollection(response);
    }
  };

  return (
    <li class={"carousel-item block " + sharedStyles["collection-item"]}>
      <header class="flex justify-content-between w-full">
        <h1>Add new Collection</h1>
        <button
          class="btn btn-circle btn-sm bg-bg text-xl ml-auto"
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
          disabled={!formValid()}
          class="btn btn-sm bg-bg text-xl ml-auto mt-2"
          onClick={onSubmit}
        >
          Add
        </button>
      </div>
    </li>
  );
}

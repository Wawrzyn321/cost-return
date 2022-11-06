import { Collection, CollectionEntry } from "../../api/types";
import { createSignal } from "solid-js";
import { useApiContext } from "../../api/ApiContext";

type NewEntryFormProps = {
  collection: Collection;
  addEntry: (entry: CollectionEntry) => void;
};

export function NewEntryForm(props: NewEntryFormProps) {
  let form: HTMLFormElement | undefined = undefined;
  const [formValid, setFormValid] = createSignal(false);
  const [comment, setComment] = createSignal("");
  const [amount, setAmount] = createSignal(0);
  const api = useApiContext()!;

  const onInput = () => {
    setFormValid(form?.checkValidity() || false);
  };

  const onSubmit = async () => {
    const body = {
      comment: comment(),
      amount: amount(),
      collectionId: props.collection.id,
    };

    const response = await api.collectionEntries.createOne(body);
    if (response instanceof Error) {
      console.log(response);
    } else {
      props.addEntry(response);
      setComment("");
      setAmount(0);
    }
  };

  return (
    <form ref={form} onInput={onInput}>
      <label class="block text-gray-700 text-sm font-bold mb-2" for="comment">
        Comment
        <input
          value={comment()}
          class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
          id="comment"
          type="text"
          placeholder="Comment"
          required
          onChange={(e) => setComment((e.target as HTMLInputElement).value)}
        />
        <label class="block text-gray-700 text-sm font-bold mb-2" for="amount">
          Amount
          <input
            value={amount()}
            class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
            id="amount"
            type="number"
            min={0.01}
            step={0.01}
            placeholder="Amount"
            required
            onChange={(e) =>
              setAmount((e.target as HTMLInputElement).valueAsNumber)
            }
          />
        </label>
      </label>

      <div class="flex justify-end mt-4">
        <button
          type="button"
          onClick={onSubmit}
          class="btn bg-bg"
          disabled={!formValid()}
        >
          Add
        </button>
      </div>
    </form>
  );
}

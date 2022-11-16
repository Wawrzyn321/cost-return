import { AsyncStatus, Collection, CollectionEntry } from '../../api/types';
import { createSignal, Show } from 'solid-js';
import { useApiContext } from '../../api/ApiContext';
import { Alert } from '../Alert';
import { BsHourglassSplit } from 'solid-icons/bs';

type NewEntryFormProps = {
  collection: Collection;
  addEntry: (entry: CollectionEntry) => void;
};

export function NewEntryForm(props: NewEntryFormProps) {
  let form: HTMLFormElement | undefined = undefined;
  const [formValid, setFormValid] = createSignal(false);
  const [comment, setComment] = createSignal('');
  const [amount, setAmount] = createSignal(0);
  const [submitStatus, setSubmitStatus] = createSignal<AsyncStatus>('none');
  const api = useApiContext()!;

  const onInput = () => {
    setFormValid(form?.checkValidity() || false);
  };

  const onSubmit = async () => {
    setSubmitStatus('pending');
    const body = {
      comment: comment(),
      amount: amount(),
      collectionId: props.collection.id,
    };

    const response = await api()!.collectionEntries.createOne(body);
    if (response instanceof Error) {
      setSubmitStatus(response);
    } else {
      props.addEntry(response);
      setComment('');
      setAmount(0);
      setSubmitStatus('none');
    }
  };

  const isCreatePending = () => submitStatus() === 'pending';

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
          onChange={e => setComment((e.target as HTMLInputElement).value)}
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
            onChange={e =>
              setAmount((e.target as HTMLInputElement).valueAsNumber)
            }
          />
        </label>
      </label>

      <div class="flex justify-end mt-4">
        <button
          type="button"
          onClick={onSubmit}
          class="btn background-color--background color-text--inverted"
          disabled={!formValid() || isCreatePending()}
        >
          <Show when={isCreatePending()}>
            <BsHourglassSplit class="swingy" />
          </Show>
          Add
        </button>
      </div>
      <Show when={submitStatus() instanceof Error}>
        <Alert message={submitStatus().toString()} />
      </Show>
    </form>
  );
}

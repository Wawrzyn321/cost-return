import { AsyncStatus, Collection } from '../../api/types';
import { createSignal, Show } from 'solid-js';
import { useApiContext } from '../../api/ApiContext';
import { BsHourglassSplit } from 'solid-icons/bs';
import copyToCliboard from 'copy-to-clipboard';
import { Alert } from '../Alert';

export function SharingForm(props: {
  collection: Collection;
  updateCollection: (col: Collection) => void;
}) {
  const [updateStatus, setUpdateStatus] = createSignal<AsyncStatus>('none');
  const [copyButtonText, setCopyButtonText] = createSignal('Copy link');
  const [copyButtonTimeout, setCopyButtonInterval] = createSignal<number>();
  const api = useApiContext()!;

  const updateSharing = async () => {
    setUpdateStatus('pending');

    const body = { ...props.collection, shared: !props.collection.shared };

    const response = await api()!.collections.updateOne(body);
    if (response instanceof Error) {
      setUpdateStatus(response);
    } else {
      props.updateCollection(response);
      setUpdateStatus('none');
    }
  };

  const copyShareLink = () => {
    copyToCliboard(`${location.origin}/shared/${props.collection.id}`);
    setCopyButtonText('Copied!');
    clearTimeout(copyButtonTimeout());
    setCopyButtonInterval(
      setTimeout(() => {
        setCopyButtonText('Copy link');
      }, 2000),
    );
  };

  const isUpdatePending = () => updateStatus() === 'pending';

  const text = () =>
    props.collection.shared ? 'Disable sharing' : 'Enable sharing';

  return (
    <div class="flex justify-between">
      <button
        class="btn background-color--background color-text--inverted w-28"
        onClick={copyShareLink}
        disabled={!props.collection.shared}
      >
        {copyButtonText}
      </button>
      <button
        type="button"
        onClick={updateSharing}
        class="btn background-color--background color-text--inverted"
        disabled={isUpdatePending()}
      >
        <Show when={isUpdatePending()}>
          <BsHourglassSplit class="swingy" />
        </Show>
        {text()}
        <Show when={updateStatus() instanceof Error}>
          <Alert message={updateStatus().toString()} />
        </Show>
      </button>
    </div>
  );
}

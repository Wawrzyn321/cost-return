import { BsExclamationOctagonFill } from 'solid-icons/bs';

export function Alert(props: { message: string }) {
  return (
    <div class="alert alert-error shadow-lg mt-4">
      <BsExclamationOctagonFill />
      <span>{props.message}</span>
    </div>
  );
}

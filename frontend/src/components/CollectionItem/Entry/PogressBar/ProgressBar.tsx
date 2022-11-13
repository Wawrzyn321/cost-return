import styles from "./ProgressBar.module.css";

export function ProgressBar(props: { value: number; max: number; }) {
  return (
    <progress
      class={`progress w-100 ${styles["progress"]}`}
      value={props.value}
      max={props.max}
    ></progress>
  );
}

import styles from "./OpenFormButton.module.css";

type ActiveProps = {
  showingForm: boolean;
  switchStatus: () => void;
  skeleton?: boolean;
};

export function OpenFormButton(props: ActiveProps) {
  const openButtonClass = () => {
    const showingFormClass = props.showingForm
      ? styles["add-new--showing-form"]
      : "";

    const skeletonClass = props.skeleton ? styles["skeleton"] : "";

    return `${styles["add-new"]} ${showingFormClass} ${skeletonClass}`;
  };

  return (
    <button
      class={openButtonClass()}
      onClick={() => (props.skeleton ? undefined : props.switchStatus())}
    >
      <span>+</span>
    </button>
  );
}

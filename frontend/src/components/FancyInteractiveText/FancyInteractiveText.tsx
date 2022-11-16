import { createEffect, createSignal, JSX, onMount } from "solid-js";
import styles from "./FancyInteractiveText.module.css";

function FancyInteractiveCharacter(props: {
  char: string;
  mouseX: number;
  mouseOver: boolean;
}) {
  let element: HTMLSpanElement | undefined = undefined;
  const [deltaX, setDeltaX] = createSignal(0);
  const [initialPosX, setInitialPosX] = createSignal(0);

  const style = (): JSX.CSSProperties => {
    return { transform: `translateX(${deltaX()}px)`, display: "inline-block" };
  };

  onMount(() => {
    setInitialPosX(element!.offsetLeft);
  });

  createEffect(() => {
    if (props.mouseOver) {
      const diff = props.mouseX - initialPosX();
      if (Math.abs(diff) > 0) {
        setDeltaX(Math.sqrt(Math.abs(diff)) * Math.sign(diff));
      }
    }
  });

  return (
    <span ref={element} style={style()}>
      {props.char}
    </span>
  );
}

export function FancyInteractiveText(props: { text: string }) {
  const [mouseOver, setMouseOver] = createSignal(false);
  const [mouseX, setMouseX] = createSignal(0);

  const onMouseEnter = (e: MouseEvent) => {
    setMouseOver(true);
    setMouseX(e.clientX);
  };

  const onMouseMove = (e: MouseEvent) => {
    setMouseX(e.clientX);
  };

  const onMouseLeave = () => setMouseOver(false);

  return (
    <div class="flex justify-center color-text--inverted whitespace-pre z-50">
      <div
        class="px-8 py-1"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
      >
        {props.text.split("").map((char) => (
          <FancyInteractiveCharacter
            char={char}
            mouseX={mouseX()}
            mouseOver={mouseOver()}
          />
        ))}
      </div>
    </div>
  );
}

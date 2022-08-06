import { Component, createEffect, createSignal } from "solid-js";

import styles from "./App.module.css";

const App: Component = () => {
  const [first, setFirst] = createSignal("JSON");
  const [last, setLast] = createSignal("Bourne");

  createEffect(() => console.log(`${first()} ${last()}!`));

  return (
    <div class={styles.App}>
      <div>
        <button class="btn btn-primary">Hello daisyUI</button>
      </div>
      <input
        type="text"
        value={first()}
        onInput={(e) => setFirst((e.target as HTMLInputElement).value)}
      />
      <input
        type="text"
        value={last()}
        onInput={(e) => setLast((e.target as HTMLInputElement).value)}
      />
    </div>
  );
};

export default App;

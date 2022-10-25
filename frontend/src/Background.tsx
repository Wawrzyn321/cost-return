import { useAuth0 } from "@rturnq/solid-auth0";
import { JSX } from "solid-js/jsx-runtime";
import styles from "./App.module.css";
import { useAuthData } from "./auth/AuthDataContext";
import svg from "./img/cashback.svg";

export function Background(props: { children: JSX.Element }) {
  const { state } = useAuthData()!;
  const { logout } = useAuth0()!;

  const VSpacer = () => <div class={styles["v-spacer"]}></div>;

  const Header = () => (
    <nav class={styles["nav"]}>
      <div class={styles["header"]}>
        <img src={svg} style={{ "margin-right": "10px" }} />
        Cost-Return
      </div>
      <p class={styles["state"]}>
        {state() ? state() : <button onClick={logout}>Logout</button>}
      </p>
    </nav>
  );

  return (
    <>
      <div class={styles["container"]}>
        <Header />
        <div class={styles["wave"]}></div>
      </div>
      <VSpacer />
      <main class={styles["content"]}>{props.children}</main>
      <VSpacer />
      <div class={`${styles["container"]} ${styles["container--bottom"]}`}>
        <div class={`${styles["wave"]} ${styles["wave--bottom"]}`}></div>
      </div>
    </>
  );
}

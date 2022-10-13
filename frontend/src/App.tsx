import { Component, createEffect, createSignal } from "solid-js";
import { useAuth0 } from "@rturnq/solid-auth0";

import styles from "./App.module.css";

// const configureClient = async () => {
//   return await createAuth0Client({
//     domain: "dev-cbdrgzv1.us.auth0.com",
//     client_id: "vX5z0xrgW89EYHI3OueNP3bH5r3PCtQo",
//     redirect_uri: "http://localhost:3000",
//   });
// };

const App: Component = () => {
  const [first, setFirst] = createSignal("JSON");
  const [last, setLast] = createSignal("Bourne");
  const [token, setToken] = createSignal("");

  createEffect(() => console.log(`${first()} ${last()}!`));

  const client = useAuth0()!;
  const { isAuthenticated, user, loginWithRedirect, logout, getToken } = client;

  createEffect(async () => {
    if (isAuthenticated()) {
      console.log("get token...");
      setToken(await getToken());
    }
  });

  const makeCall = async () => {
    console.log(token);
    console.log(token());
    try {
      const response = await fetch("http://127.0.0.1:60057/api/users", {
        headers: { Authorization: token() },
      });
      console.log(await response.text());
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div class={styles.App}>
      {JSON.stringify(user() || {})}
      <p>Token: {token()}</p>
      <div>
        <button
          class="btn btn-primary"
          onClick={loginWithRedirect}
          disabled={isAuthenticated()}
        >
          Login
        </button>
        <button
          class="btn btn-primary"
          onClick={logout}
          disabled={!isAuthenticated()}
        >
          Logout
        </button>
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

      <button
        class="btn btn-primary"
        onClick={makeCall}
        disabled={!isAuthenticated()}
      >
        Call
      </button>
    </div>
  );
};

export default App;

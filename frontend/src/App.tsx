import { Component, createEffect, createSignal, For } from "solid-js";
import { useAuth0 } from "@rturnq/solid-auth0";

import styles from "./App.module.css";
import { ApiContextProvider, useApiContext } from "./api/ApiContext";
import { ResponseContent } from "./api/responseTypes";
import { Collection } from "./api/types";
import PocketBase from 'pocketbase'


window['pocketbase'] = new PocketBase('http://pocketbase-admin.oto-jest-wawrzyn.pl');

const AuthenticatedPart: Component = () => {
  const getApi = useApiContext();
  const [collections, setCollections] =
    createSignal<ResponseContent<Collection> | null>(null);

  const [error, setError] = createSignal<Error | null>();

  const callApi = async () => {
    const response = await getApi!()!.collections.getAll();
    if (response instanceof Error) {
      setError(response);
    } else {
      console.log(response);
      setCollections(response);
    }
  };

  return (
    <>
      {!collections() && <button onClick={callApi}>A</button>}
      {error() && <p>{error()?.message}</p>}
      {collections() && (
        <>
          LISTA
          <ul>
            <For each={collections()?.items}>
              {(col) => <li>{col.name}</li>}
            </For>
          </ul>
        </>
      )}
    </>
  );
};

const App: Component = () => {
  const [first, setFirst] = createSignal("JSON");
  const [last, setLast] = createSignal("Bourne");

  createEffect(() => console.log(`${first()} ${last()}!`));

  const client = useAuth0()!;
  const { isAuthenticated, user, loginWithRedirect, logout, getToken } = client;

  // const makeCall = async () => {
  //   console.log(token());
  //   try {
  //     const ADDRESS = true
  //       ? "https://cost-return-backend.oto-jest-wawrzyn.pl"
  //       : "http://127.0.0.1:60057/api/users";
  //     const response = await fetch(ADDRESS, {
  //       headers: { Authorization: token() },
  //     });
  //     console.log(await response.text());
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  return (
    <div class={styles.App}>
      {JSON.stringify(user() || {})}
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

      {isAuthenticated() && (
        <ApiContextProvider>
          <AuthenticatedPart />
        </ApiContextProvider>
      )}
    </div>
  );
};

export default App;

import { Component, createEffect, createSignal, For } from "solid-js";
import { useAuth0 } from "@rturnq/solid-auth0";

import { useApiContext } from "./api/ApiContext";
import { ResponseContent } from "./api/responseTypes";
import { Collection } from "./api/types";
import { useAuthData } from "./auth/AuthDataContext";

const AuthenticatedPart: Component = () => {
  const api = useApiContext()!;
  const [collections, setCollections] =
    createSignal<ResponseContent<Collection> | null>(null);

  const [error, setError] = createSignal<Error | null>();

  const callApi = async () => {
    const response = await api.collections.getAll();
    if (response instanceof Error) {
      setError(response);
    } else {
      console.log(response);
      setCollections(response);
    }
  };

  return (
    <>
      {!collections() && (
        <button class="btn btn-primary" onClick={callApi}>
          GET COLS
        </button>
      )}
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
  const { user } = useAuth0()!;
  const { authData } = useAuthData()!;

  createEffect(() => {
    console.log({ authData: authData() });
  });

  return (
    <div>
      {JSON.stringify(user() || {})}
      <AuthenticatedPart />
      {/* <button onClick={makeCall}>CALL</button> */}
      {/* <input
        type="text"
        value={first()}
        onInput={(e) => setFirst((e.target as HTMLInputElement).value)}
      /> */}
    </div>
  );
};

export default App;

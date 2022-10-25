import { useAuth0 } from "@rturnq/solid-auth0";
import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  JSX,
  useContext,
} from "solid-js";
import { AuthData, useAuthData } from "../auth/AuthDataContext";
import { GetAllResponse } from "./responseTypes";
// import { createApi, Api } from "./createApi";
import { Collection } from "./types";

type ResourceApi<T> = {
  getAll: () => Promise<GetAllResponse<T>>;
};

type Api = {
  collections: ResourceApi<Collection>;
};

function createApi<T>(
  collectionType: string,
  { auth0Token, pocketbaseToken }: AuthData
): ResourceApi<T> {
  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const url = `${baseUrl}/api/collections/${collectionType}/records`;
  return {
    getAll: async () => {
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: auth0Token,
            "X-Cost-Return-PB-Token": pocketbaseToken,
          },
        });
        if (!response.ok) {
          throw Error();
        }
        return await response.json();
      } catch (e) {
        if (e instanceof Error) {
          return { error: e };
        } else {
          console.warn(e);
          return { error: new Error("unknown error " + e) };
        }
      }
    },
  };
}

const ApiContext = createContext<Api>();

export const ApiContextProvider = (props: { children: JSX.Element }) => {
  const { authData } = useAuthData()!;
  const [api, setApi] = createSignal<Api | null>(null);

  createEffect(() => {
    const data = authData();
    if (data) {
      setApi({
        collections: createApi<Collection>("collections", data),
      });
    }
  });

  return (
    <>
      {api() ? (
        <ApiContext.Provider value={api()!}>
          {props.children}
        </ApiContext.Provider>
      ) : (
        "LOADING"
      )}
    </>
  );
};

export function useApiContext() {
  return useContext(ApiContext);
}

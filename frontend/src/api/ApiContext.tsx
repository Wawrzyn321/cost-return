import {
  createContext,
  createEffect,
  createSignal,
  JSX,
  useContext,
} from "solid-js";
import { useAuthData } from "../auth/AuthDataContext";
import { createApi, ResourceApi } from "./createApi";
import { Collection, CollectionEntry } from "./types";

type Api = {
  collections: ResourceApi<Collection>;
  collectionEntries: ResourceApi<CollectionEntry>;
};

const ApiContext = createContext<Api>();

export const ApiContextProvider = (props: { children: JSX.Element }) => {
  const { authData } = useAuthData()!;
  const [api, setApi] = createSignal<Api | null>(null);

  createEffect(() => {
    const data = authData();
    if (data) {
      setApi({
        collections: createApi<Collection>("collections", data),
        collectionEntries: createApi<CollectionEntry>(
          "collectionEntries",
          data
        ),
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
        <div class="flex justify-center items-center">
          <div
            class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
            role="status"
          >
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </>
  );
};

export function useApiContext() {
  return useContext(ApiContext);
}

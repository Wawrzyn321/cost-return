import { useAuth0 } from "@rturnq/solid-auth0";
import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  JSX,
  useContext,
} from "solid-js";
import { GetAllResponse } from "./responseTypes";
// import { createApi, Api } from "./createApi";
import { Collection } from "./types";

type Api = {
  collections: {
    getAll: () => Promise<GetAllResponse<Collection>>;
  };
};

const createApi = ({
  token,
  userId,
}: {
  token: string;
  userId: string;
}): Api => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const collectionsUrl = `${baseUrl}/collections`;

  return {
    collections: {
      getAll: async () => {
        try {
          const response = await fetch(collectionsUrl, {
            headers: {
              Authorization: token,
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
    },
  };
};

const ApiContext = createContext<Accessor<Api | undefined>>();

export const ApiContextProvider = (props: { children: JSX.Element }) => {
  const { getToken, user } = useAuth0()!;

  const [api, setApi] = createSignal<Api | undefined>();

  createEffect(async () => {
    const token = await getToken();
    console.log("set value");
    setApi(createApi({ token, userId: user().sub }));
  });

  return (
    <ApiContext.Provider value={api}>
      {api() ? props.children : "Loading..."}
    </ApiContext.Provider>
  );
};

export function useApiContext() {
  return useContext(ApiContext);
}

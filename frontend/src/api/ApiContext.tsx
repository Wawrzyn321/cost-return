import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  JSX,
  useContext,
} from 'solid-js';
import { useAuthData } from '../auth/AuthDataContext';
import { createApi, ResourceApi } from './createApi';
import { Collection, CollectionEntry } from './types';

type Api = {
  collections: ResourceApi<Collection>;
  collectionEntries: ResourceApi<CollectionEntry>;
};

const ApiContext = createContext<Accessor<Api | null>>();

export const ApiContextProvider = (props: { children: JSX.Element }) => {
  const { authData } = useAuthData()!;
  const [api, setApi] = createSignal<Api | null>(null);

  createEffect(() => {
    const data = authData();
    if (data) {
      setApi({
        collections: createApi<Collection>('collections', data),
        collectionEntries: createApi<CollectionEntry>(
          'collectionEntries',
          data,
        ),
      });
    }
  });

  return (
    <ApiContext.Provider value={api}>{props.children}</ApiContext.Provider>
  );
};

export function useApiContext() {
  return useContext(ApiContext);
}

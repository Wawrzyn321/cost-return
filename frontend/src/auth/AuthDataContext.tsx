import { login } from './login';

import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  JSX,
  useContext,
} from 'solid-js';
import { useAuth0 } from '@rturnq/solid-auth0';

export type AuthData = {
  auth0Token: string;
  pocketbaseToken: string;
  pocketbaseUserId: string;
  pocketbaseProfileId: string;
};

export type AuthDataContextType = {
  authData: Accessor<AuthData | null>;
  state: Accessor<string | null>;
};

const AuthDataContext = createContext<AuthDataContextType>();

export const AuthDataProvider = (props: { children: JSX.Element }) => {
  const [authData, setAuthData] = createSignal<AuthData | null>(null);
  const [contextState, setContextState] = createSignal<string | null>(null);
  const [fetchedData, setFetchedData] = createSignal(false);

  const {
    getToken,
    isInitialized,
    isAuthenticated,
    loginWithRedirect,
  } = useAuth0()!;

  createEffect(async () => {
    if (isInitialized() && !isAuthenticated()) {
      setContextState('Logging in...');
      loginWithRedirect();
      return;
    }

    if (fetchedData()) return;
    setFetchedData(true);

    try {
      setContextState('Getting auth0 token...');
      const auth0Token = await getToken();
      setContextState('Getting DB token...');
      const {
        token: pocketbaseToken,
        userId: pocketbaseUserId,
        profileId: pocketbaseProfileId,
      } = await login(auth0Token);

      setAuthData({
        auth0Token,
        pocketbaseToken: pocketbaseToken,
        pocketbaseUserId: pocketbaseUserId,
        pocketbaseProfileId: pocketbaseProfileId,
      });
      setContextState(null);
    } catch (e) {
      if (e instanceof Error) {
        console.error('Login error:', e);
        setContextState(`Error: ${e.message}.`);
      } else {
        console.error(typeof e);
        console.error(e);
        alert((e as any)?.message);
        throw e;
      }
    }
  });

  return (
    <AuthDataContext.Provider value={{ authData, state: contextState }}>
      {props.children}
    </AuthDataContext.Provider>
  );
};

export const useAuthData = () => {
  return useContext(AuthDataContext);
};

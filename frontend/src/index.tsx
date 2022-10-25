import { Auth0 } from "@rturnq/solid-auth0";
import { render } from "solid-js/web";
import { ApiContextProvider } from "./api/ApiContext";
import { Background } from "./Background";
import { AuthDataProvider } from "./auth/AuthDataContext";
import App from "./App";

import "./index.css";

render(
  () => (
    <Auth0
      domain="dev-cbdrgzv1.us.auth0.com"
      clientId="7oylbOMFecpQgTflRNOqgnyQAvRX8rnp"
      audience="cost-return-api"
      logoutRedirectUri={`${window.location.origin}/logout`}
      loginRedirectUri={`${window.location.origin}/`}
    >
      <AuthDataProvider>
        <Background>
          <ApiContextProvider>
            <App />
          </ApiContextProvider>
        </Background>
      </AuthDataProvider>
    </Auth0>
  ),
  document.getElementById("root") as HTMLElement
);

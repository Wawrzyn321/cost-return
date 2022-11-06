import { Auth0 } from "@rturnq/solid-auth0";
import { render } from "solid-js/web";
import { ApiContextProvider } from "./api/ApiContext";
import { Layout } from "./components/Layout/Layout";
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
        <Layout>
          <ApiContextProvider>
            <App />
          </ApiContextProvider>
        </Layout>
      </AuthDataProvider>
    </Auth0>
  ),
  document.getElementById("root") as HTMLElement
);

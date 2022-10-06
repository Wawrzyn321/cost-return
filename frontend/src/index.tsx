import { render } from "solid-js/web";
import { Auth0 } from "@rturnq/solid-auth0";

import "./index.css";
import App from "./App";

render(
  () => (
    <Auth0
      domain="dev-cbdrgzv1.us.auth0.com"
      clientId="7oylbOMFecpQgTflRNOqgnyQAvRX8rnp"
      audience="cost-return-api"
      logoutRedirectUri={`${window.location.origin}/logout`}
      loginRedirectUri={`${window.location.origin}/`}
    >
      <App />
    </Auth0>
  ),
  document.getElementById("root") as HTMLElement
);

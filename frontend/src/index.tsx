import { render } from "solid-js/web";
import { Auth0 } from "@rturnq/solid-auth0";

import "./index.css";
import App from "./App";

render(
  () => (
    <Auth0
      domain="dev-cbdrgzv1.us.auth0.com"
      clientId="vX5z0xrgW89EYHI3OueNP3bH5r3PCtQo"
      logoutRedirectUri={`${window.location.origin}/logout`}
      loginRedirectUri={`${window.location.origin}/`}
    >
      <App />
    </Auth0>
  ),
  document.getElementById("root") as HTMLElement
);

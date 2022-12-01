import { Auth0 } from '@rturnq/solid-auth0';
import { render } from 'solid-js/web';
import { ApiContextProvider } from './api/ApiContext';
import { Layout } from './components/Layout/Layout';
import { AuthDataProvider } from './auth/AuthDataContext';
import { Route, Router, Routes, useParams } from '@solidjs/router';
import { SharedCollectionView } from './components/shared/SharedCollectionView';
import App from './App';

import './index.css';

const Main = () => (
  <Auth0
    domain="dev-cbdrgzv1.us.auth0.com"
    clientId="7oylbOMFecpQgTflRNOqgnyQAvRX8rnp"
    audience="cost-return-api"
    logoutRedirectUri={`${window.location.origin}/logout`}
    loginRedirectUri={`${window.location.origin}/`}
  >
    <AuthDataProvider>
      <Layout withAuth>
        <ApiContextProvider>
          <App />
        </ApiContextProvider>
      </Layout>
    </AuthDataProvider>
  </Auth0>
);

const Shared = () => {
  const params = useParams();

  return (
    <Layout withAuth={false}>
      <SharedCollectionView collectionId={params.id} />
    </Layout>
  );
};

render(
  () => (
    <Router>
      <Routes>
        <Route path="/shared/:id" component={Shared} />
        <Route path="*" component={Main} />
      </Routes>
    </Router>
  ),
  document.getElementById('root') as HTMLElement,
);

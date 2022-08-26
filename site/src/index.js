import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { FirebaseAppProvider } from 'reactfire';
import { config } from './config';
import { Provider } from 'react-redux';
import {store} from './redux/store.ts'

ReactDOM.render(
  <FirebaseAppProvider firebaseConfig={config.firebase}>
    <Suspense fallback={<h3>Loading...</h3>}>
      <React.StrictMode>
        <Provider store={store}>
          <App />
        </Provider>
      </React.StrictMode>
    </Suspense>
  </FirebaseAppProvider>,
  document.getElementById('root')
);

serviceWorker.register();

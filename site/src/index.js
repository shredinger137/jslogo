import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { FirebaseAppProvider } from 'reactfire';
import {config} from './config';


ReactDOM.render(
<FirebaseAppProvider firebaseConfig={config.firebase}>
    <Suspense fallback={<h3>Loading...</h3>}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </Suspense>
  </FirebaseAppProvider>,
  document.getElementById('root')
);


//This is the part that makes it a PWA. Temporarily disabled due to the speed of new releases. Change to 'register' when out of alpha.

serviceWorker.unregister();

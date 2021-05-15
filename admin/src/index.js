import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
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



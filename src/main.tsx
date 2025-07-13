import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { InitialLoader } from './components/InitialLoader.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <InitialLoader>
          <App />
        </InitialLoader>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

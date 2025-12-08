import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthContext.tsx';
import { SpaceProvider } from './space/SpaceContext.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <SpaceProvider>
            <App />
          </SpaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
}

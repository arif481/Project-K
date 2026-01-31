import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { RecoveryProvider } from './context/RecoveryContext';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import './styles/index.css';
import './styles/components.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <RecoveryProvider>
        <App />
      </RecoveryProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>,
);

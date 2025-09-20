import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PrivyAppProvider } from './PrivyProvider';
import AuthGuard from './AuthGuard';
import './index.css';

// Console log control - disable all console logs in production
window.DEBUG = import.meta.env.DEV; // true in development, false in production

// Setup console logging control
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug
};

if (!window.DEBUG) {
  // Override console methods to be no-ops (do nothing)
  console.log = console.warn = console.info = console.debug = () => {};
  // console.error = () => {}; // Temporarily enable error logging for debugging
  
  // Method to temporarily restore logging if needed for debugging
  window.enableLogs = () => {
    Object.assign(console, originalConsole);
    console.log('Console logging restored temporarily');
  };
  
  // Method to disable logs again
  window.disableLogs = () => {
    console.log = console.warn = console.info = console.debug = () => {};
    console.error = () => {};
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <PrivyAppProvider>
    <AuthGuard>
      <App />
    </AuthGuard>
  </PrivyAppProvider>
);

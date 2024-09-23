// index.tsx or index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement); // Use createRoot instead of ReactDOM.render
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

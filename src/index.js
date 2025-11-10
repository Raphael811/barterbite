import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';  // <-- must match your App.jsx file
import './index.css';          // optional

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

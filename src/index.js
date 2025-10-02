import React from 'react';
import ReactDOM from 'react-dom/client'; // 👈 React 18 uses 'react-dom/client'
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; // Import Tailwind styles
import reportWebVitals from './reportWebVitals'; // 👈 Make sure this file exists

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

reportWebVitals();

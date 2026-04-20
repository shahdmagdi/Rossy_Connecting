// Entry point of your application
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('index.js is executing');

const root = ReactDOM.createRoot(document.getElementById('root'));
console.log('About to render App');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('App rendered');
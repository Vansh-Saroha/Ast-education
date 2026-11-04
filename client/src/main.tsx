import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { FactsProvider } from './lib/facts';
import './styles/site.css';

const root = document.getElementById('root')!;
const tree = (
  <React.StrictMode>
    <BrowserRouter>
      <FactsProvider>
        <App />
      </FactsProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Public pages arrive pre-rendered, so the browser attaches to the existing markup. Admin pages start empty.
if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(root, tree);
} else {
  ReactDOM.createRoot(root).render(tree);
}

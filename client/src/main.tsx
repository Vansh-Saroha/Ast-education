import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App, { type AppPageComponents } from './App';
import { FactsProvider } from './lib/facts';
import './styles/site.css';
import './styles/clay.css';

const root = document.getElementById('root')!;

async function loadInitialPage(pathname: string): Promise<Partial<AppPageComponents>> {
  const path = pathname.replace(/\/+$/, '') || '/';
  switch (path) {
    case '/':
    case '/about':
      return import('./pages/ApprovedPage').then((module) => ({ ApprovedPage: module.default }));
    case '/courses':
      return import('./pages/CoursesPage').then((module) => ({ CoursesPage: module.default }));
    case '/leadership':
      return import('./pages/LeadershipPage').then((module) => ({ LeadershipPage: module.default }));
    case '/certifications':
      return import('./pages/CertificationsPage').then((module) => ({ CertificationsPage: module.default }));
    case '/gallery':
      return import('./pages/GalleryPage').then((module) => ({ GalleryPage: module.default }));
    case '/testimonials':
      return import('./pages/TestimonialsPage').then((module) => ({ TestimonialsPage: module.default }));
    case '/contact':
      return import('./pages/ContactPage').then((module) => ({ ContactPage: module.default }));
    case '/enquiry':
      return import('./pages/EnquiryPage').then((module) => ({ EnquiryPage: module.default }));
    case '/videos':
      return import('./pages/VideosPage').then((module) => ({ VideosPage: module.default }));
    case '/privacy':
      return import('./pages/LegalPages').then((module) => ({ PrivacyPage: module.PrivacyPage }));
    case '/terms':
      return import('./pages/LegalPages').then((module) => ({ TermsPage: module.TermsPage }));
    default:
      if (path.startsWith('/admin') || path === '/owner/login') return {};
      return import('./pages/LegalPages').then((module) => ({ NotFoundPage: module.NotFoundPage }));
  }
}

// Load the prerendered route before hydration so the server and client start with the same page component.
void loadInitialPage(window.location.pathname).then((pageComponents) => {
  const tree = (
    <React.StrictMode>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FactsProvider>
          <App pageComponents={pageComponents} />
        </FactsProvider>
      </BrowserRouter>
    </React.StrictMode>
  );

  if (root.hasChildNodes()) {
    ReactDOM.hydrateRoot(root, tree);
  } else {
    ReactDOM.createRoot(root).render(tree);
  }
});

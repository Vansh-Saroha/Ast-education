import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App, { type AppPageComponents } from './App';
import { FactsProvider } from './lib/facts';
import ApprovedPage from './pages/ApprovedPage';
import CertificationsPage from './pages/CertificationsPage';
import ContactPage from './pages/ContactPage';
import CoursesPage from './pages/CoursesPage';
import EnquiryPage from './pages/EnquiryPage';
import GalleryPage from './pages/GalleryPage';
import LeadershipPage from './pages/LeadershipPage';
import { NotFoundPage, PrivacyPage, TermsPage } from './pages/LegalPages';
import TestimonialsPage from './pages/TestimonialsPage';
import VideosPage from './pages/VideosPage';

const serverPages: AppPageComponents = {
  ApprovedPage,
  CertificationsPage,
  ContactPage,
  CoursesPage,
  EnquiryPage,
  GalleryPage,
  LeadershipPage,
  NotFoundPage,
  PrivacyPage,
  TermsPage,
  TestimonialsPage,
  VideosPage,
};

// Renders one public page to HTML at build time. Nothing here makes network requests. Each page starts from the
// same approved state the browser starts from, so the browser can hydrate the markup without differences.
export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <FactsProvider>
        <App pageComponents={serverPages} />
      </FactsProvider>
    </StaticRouter>,
  );
}

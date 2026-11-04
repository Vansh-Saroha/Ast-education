import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useFacts } from './lib/facts';
import { applyHead } from './lib/seo';
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

// Admin screens load only when an administrator opens them.
const AdminShell = lazy(() => import('./admin/AdminShell'));
const ContentPage = lazy(() => import('./admin/ContentPage'));
const DashboardPage = lazy(() => import('./admin/DashboardPage'));
const EnquiryDetailPage = lazy(() => import('./admin/EnquiryDetailPage'));
const FactsPage = lazy(() => import('./admin/FactsPage'));
const LoginPage = lazy(() => import('./admin/LoginPage'));
const AdminVideosPage = lazy(() => import('./admin/VideosPage'));

const NAV = [
  ['/courses', 'Courses'], ['/leadership', 'Leadership'], ['/certifications', 'Certifications'],
  ['/about', 'About'], ['/gallery', 'Gallery'], ['/videos', 'Videos'], ['/testimonials', 'Testimonials'], ['/contact', 'Contact'],
] as const;

function PublicLayout() {
  const location = useLocation();
  const { facts, availability, snapshotDate } = useFacts();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    applyHead(location.pathname);
    setOpen(false);
  }, [location.pathname]);

  const digits = (facts.whatsapp ?? '').replace(/\D/g, '');

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className={open ? 'open' : ''}>
        <div className="wrap bar">
          <Link className="brand" to="/" aria-label="AST Education home">
            <img src="/assets/logo.webp" alt="AST Education logo" width={58} height={58} />
          </Link>
          <button className="menu-btn" type="button" aria-expanded={open} aria-controls="nav" onClick={() => setOpen((o) => !o)}>
            Menu
          </button>
          <nav id="nav" aria-label="Main">
            <ul>
              {NAV.map(([to, label]) => (
                <li key={to}><NavLink to={to}>{label}</NavLink></li>
              ))}
              <li><Link className="btn btn-o" to="/enquiry">Admission enquiry</Link></li>
              <li><Link className="btn btn-n" to="/admin/login">Owner Sign In</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer>
        <div className="fg">
          <div>
            <p><strong style={{ color: '#fff', fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.15rem' }}>AST Education</strong><br />ALL STUDIES &amp; TECHNICAL EDUCATION<br />{facts.address}</p>
            {facts.parentOrganisation && <p>Parent organisation: {facts.parentOrganisation}</p>}
            {availability === 'fallback' && <p className="hint" style={{ color: '#E6ECF4' }}>Live details unavailable. Showing approved details from {snapshotDate}.</p>}
          </div>
          <div>
            <p>
              {facts.phone && <a href={`tel:${facts.phone.replace(/\s/g, '')}`}>{facts.phone}</a>}
              {facts.hours && <><br />{facts.hours}</>}
            </p>
            {digits && <p><a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></p>}
          </div>
          <div>
            <p><Link to="/privacy">Privacy Policy</Link><br /><Link to="/terms">Terms of Use</Link><br /><Link to="/enquiry">Admission Enquiry</Link><br /><Link to="/admin/login">Owner Sign In</Link></p>
            <p>© 2026 AST Education. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <Suspense fallback={<p className="admin-status" role="status">Loading…</p>}>
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="enquiries/:id" element={<EnquiryDetailPage />} />
          <Route path="content/:type" element={<ContentPage />} />
          <Route path="facts" element={<FactsPage />} />
          <Route path="videos" element={<AdminVideosPage />} />
        </Route>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<ApprovedPage name="home" />} />
          <Route path="/about" element={<ApprovedPage name="about" />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/leadership" element={<LeadershipPage />} />
          <Route path="/certifications" element={<CertificationsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/enquiry" element={<EnquiryPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

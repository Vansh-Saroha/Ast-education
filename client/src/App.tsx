import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react';
import { Link, Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useFacts } from './lib/facts';
import { applyHead } from './lib/seo';
import { SOCIAL } from './lib/site';

const ApprovedPage = lazy(() => import('./pages/ApprovedPage'));
const CertificationsPage = lazy(() => import('./pages/CertificationsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const EnquiryPage = lazy(() => import('./pages/EnquiryPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const LeadershipPage = lazy(() => import('./pages/LeadershipPage'));
const NotFoundPage = lazy(() => import('./pages/LegalPages').then(({ NotFoundPage }) => ({ default: NotFoundPage })));
const PrivacyPage = lazy(() => import('./pages/LegalPages').then(({ PrivacyPage }) => ({ default: PrivacyPage })));
const TermsPage = lazy(() => import('./pages/LegalPages').then(({ TermsPage }) => ({ default: TermsPage })));
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'));
const VideosPage = lazy(() => import('./pages/VideosPage'));

export type AppPageComponents = {
  ApprovedPage: ComponentType<{ name: 'home' | 'about' }>;
  CertificationsPage: ComponentType;
  ContactPage: ComponentType;
  CoursesPage: ComponentType;
  EnquiryPage: ComponentType;
  GalleryPage: ComponentType;
  LeadershipPage: ComponentType;
  NotFoundPage: ComponentType;
  PrivacyPage: ComponentType;
  TermsPage: ComponentType;
  TestimonialsPage: ComponentType;
  VideosPage: ComponentType;
};

const CLIENT_PAGES: AppPageComponents = {
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

// Admin screens load only when an administrator opens them.
const AdminShell = lazy(() => import('./admin/AdminShell'));
const ContentPage = lazy(() => import('./admin/ContentPage'));
const DashboardPage = lazy(() => import('./admin/DashboardPage'));
const EnquiryDetailPage = lazy(() => import('./admin/EnquiryDetailPage'));
const FactsPage = lazy(() => import('./admin/FactsPage'));
const LoginPage = lazy(() => import('./admin/LoginPage'));
const AdminVideosPage = lazy(() => import('./admin/VideosPage'));
const TestimonialsManagePage = lazy(() => import('./admin/TestimonialsManagePage'));

const NAV = [
  ['/','Home'],
  ['/courses', 'Courses'], ['/leadership', 'Leadership'], ['/certifications', 'Certifications'],
  ['/about', 'About'], ['/gallery', 'Gallery'], ['/videos', 'Videos'], ['/testimonials', 'Testimonials'], ['/contact', 'Contact'],
] as const;

const FOOTER_LINKS = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/courses', 'Courses'],
  ['/enquiry', 'Admission'],
  ['/leadership', 'Leadership'],
  ['/contact', 'Contact'],
] as const;

// Course areas as they are named on the approved home page.
const FOOTER_COURSES = [
  ['School Education', 'school-education'],
  ['Higher Education Coaching', 'higher-education-coaching'],
  ['Computer Education', 'computer-education'],
  ['Programming & Technical', 'programming-technical'],
  ['Personality Development', 'personality-development'],
];

function scrollToTop() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
}

function PublicLayout() {
  const location = useLocation();
  const { facts, availability, snapshotDate } = useFacts();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    applyHead(location.pathname);
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  useEffect(() => {
    // Subtle 3D tilt for cards under a fine pointer. Skipped on touch screens and when reduced motion is requested.
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;
    let active: HTMLElement | null = null;
    const clear = (el: HTMLElement | null) => {
      el?.style.removeProperty('--clay-tilt-x');
      el?.style.removeProperty('--clay-tilt-y');
    };
    const onMove = (event: PointerEvent) => {
      const card = event.target instanceof Element ? (event.target.closest('.card') as HTMLElement | null) : null;
      if (card !== active) {
        clear(active);
        active = card;
      }
      if (!card) return;
      const box = card.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width - 0.5;
      const py = (event.clientY - box.top) / box.height - 0.5;
      card.style.setProperty('--clay-tilt-x', `${(-py * 6).toFixed(2)}deg`);
      card.style.setProperty('--clay-tilt-y', `${(px * 8).toFixed(2)}deg`);
    };
    const onLeave = () => {
      clear(active);
      active = null;
    };
    document.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      clear(active);
    };
  }, []);

  const digits = (facts.whatsapp ?? '').replace(/\D/g, '');

  return (
    <div className="site-shell">
      <div className="clay-decor" aria-hidden="true">
        <span className="clay-aurora" />
        <span className="clay-orb clay-orb--sky" />
        <span className="clay-orb clay-orb--violet" />
        <span className="clay-orb clay-orb--teal" />
        <img className="clay-decor__cap" src="/assets/decor/graduation-cap.svg" alt="" width={170} height={170} />
        <img className="clay-decor__book" src="/assets/decor/books.svg" alt="" width={190} height={138} />
      </div>

      <a className="skip" href="#main">Skip to content</a>
      <header className={`site-header${open ? ' open' : ''}`}>
        <div className="wrap bar">
          <Link className="brand" to="/" aria-label="AST Education home">
            <img src="/assets/logo.webp" alt="AST Education logo" width={58} height={58} />
          </Link>
          <button className="menu-btn" type="button" aria-expanded={open} aria-controls="nav" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => setOpen((o) => !o)}>
            <span className="menu-label">{open ? 'Close' : 'Menu'}</span>
            <span className="menu-icon" aria-hidden="true"><i /><i /></span>
          </button>
          <nav id="nav" aria-label="Main">
            <ul>
              {NAV.map(([to, label]) => (
                <li key={to}><NavLink to={to} end={to === '/'}>{label}</NavLink></li>
              ))}
              <li><Link className="btn btn-o" to="/enquiry">Admission Enquiry</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" key={location.pathname} className="route-view">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer__panel">
          <div className="fg">
            <div className="fcol">
              <img className="fcol__logo" src="/assets/logo.webp" alt="" width={64} height={64} />
              <p className="fcol__name">AST Education</p>
              <p className="fcol__legal">ALL STUDIES &amp; TECHNICAL EDUCATION</p>
              <p>School coaching, computer courses, technical skill development and personality development, all from one institute.</p>
              <p className="fcol__tagline" lang="hi">विश्वास आपका, ज्ञान हमारा</p>
              {facts.parentOrganisation && <p className="fcol__small">Parent organisation: {facts.parentOrganisation}</p>}
              {availability === 'fallback' && <p className="hint fcol__small">Live details unavailable. Showing approved details from {snapshotDate}.</p>}
            </div>

            <nav className="fcol" aria-label="Footer quick links">
              <h2 className="fcol__title">Quick links</h2>
              <ul>
                {FOOTER_LINKS.map(([to, label]) => (
                  <li key={to}><Link to={to}>{label}</Link></li>
                ))}
              </ul>
            </nav>

            <div className="fcol">
              <h2 className="fcol__title">Our courses</h2>
              <ul>
                {FOOTER_COURSES.map(([course, sectionId]) => (
                  <li key={sectionId}><Link to={`/courses#${sectionId}`}>{course}</Link></li>
                ))}
              </ul>
            </div>

            <div className="fcol">
              <h2 className="fcol__title">Contact</h2>
              {facts.address && <p className="fcol__address">{facts.address}</p>}
              <ul>
                {facts.phone && <li><a href={`tel:${facts.phone.replace(/\s/g, '')}`}>{facts.phone}</a></li>}
                {digits && <li><a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">WhatsApp: {facts.whatsapp}</a></li>}
                {facts.hours && <li className="fcol__small">{facts.hours}</li>}
              </ul>
            </div>
          </div>

          <div className="fsocial" role="group" aria-label="Follow AST Education">
            <p className="fsocial__title">Follow AST Education</p>
            {SOCIAL.map((item) => (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.label} (opens in a new tab)`} title={item.label}>
                <img src={item.icon} alt="" width={24} height={24} />
              </a>
            ))}
            {digits && (
              <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp (opens in a new tab)" title="WhatsApp">
                <img src="/assets/social/whatsapp.svg" alt="" width={24} height={24} />
              </a>
            )}
          </div>

          <div className="fbottom">
            <p>© {new Date().getFullYear()} AST Education. All rights reserved.</p>
            <div className="fbottom__links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Use</Link>
              <button type="button" className="to-top" onClick={scrollToTop}>Back to top</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App({ pageComponents = {} }: { pageComponents?: Partial<AppPageComponents> }) {
  const pages = { ...CLIENT_PAGES, ...pageComponents };
  const {
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
  } = pages;

  return (
    <Suspense fallback={<p className="admin-status" role="status">Loading…</p>}>
      <Routes>
        <Route path="/owner/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<Navigate to="/owner/login" replace />} />
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="enquiries/:id" element={<EnquiryDetailPage />} />
          <Route path="content/:type" element={<ContentPage />} />
          <Route path="facts" element={<FactsPage />} />
          <Route path="videos" element={<AdminVideosPage />} />
          <Route path="testimonials" element={<TestimonialsManagePage />} />
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

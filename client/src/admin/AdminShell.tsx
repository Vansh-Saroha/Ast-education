import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { adminApi, type Admin } from './api';
import '../styles/admin.css';
import '../styles/clay-admin.css';

export default function AdminShell() {
  // undefined = checking, null = signed out, Admin = signed in
  const [admin, setAdmin] = useState<Admin | null | undefined>(undefined);
  const [signingOut, setSigningOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';
    adminApi.me().then((r) => setAdmin(r.admin)).catch(() => setAdmin(null));
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileNavOpen]);

  async function signOut() {
    setSigningOut(true);
    try {
      await adminApi.logout();
    } finally {
      navigate('/owner/login', { replace: true });
    }
  }

  if (admin === undefined) {
    return <p className="admin-status" role="status">Checking your session…</p>;
  }
  if (admin === null) {
    return <Navigate to="/owner/login" replace />;
  }

  return (
    <div className="admin">
      <aside className={`admin-side${mobileNavOpen ? ' admin-side--open' : ''}`} aria-label="Admin sidebar">
        <div className="admin-topbar">
          <div className="admin-brand">
            <img src="/assets/logo.webp" alt="AST Education" width={44} height={44} />
            <div>
              <strong>AST Education</strong>
              <span>Admin</span>
            </div>
          </div>
          <button
            className="admin-menu-toggle"
            type="button"
            aria-controls="admin-navigation"
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? 'Close admin navigation' : 'Open admin navigation'}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <span className="admin-menu-icon" aria-hidden="true"><i /><i /><i /></span>
            <span>{mobileNavOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>
        <nav id="admin-navigation" className={mobileNavOpen ? 'is-open' : ''} aria-label="Admin">
          <NavLink to="/admin" end onClick={() => setMobileNavOpen(false)}>Enquiries</NavLink>
          <NavLink to="/admin/content/courses" onClick={() => setMobileNavOpen(false)}>Courses</NavLink>
          <NavLink to="/admin/content/leadership" onClick={() => setMobileNavOpen(false)}>Leadership</NavLink>
          <NavLink to="/admin/content/gallery" onClick={() => setMobileNavOpen(false)}>Gallery</NavLink>
          {admin.role === 'owner' && <NavLink to="/admin/testimonials" onClick={() => setMobileNavOpen(false)}>Manage Testimonials</NavLink>}
          <NavLink to="/admin/facts" onClick={() => setMobileNavOpen(false)}>Business facts</NavLink>
          <NavLink to="/admin/videos" onClick={() => setMobileNavOpen(false)}>Videos</NavLink>
        </nav>
        <div className="admin-user">
          <p><strong>{admin.name}</strong><br />{admin.role === 'owner' ? 'Owner' : 'Staff'}</p>
          <button className="btn btn-g" type="button" onClick={signOut} disabled={signingOut}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>
      <main className="admin-main" id="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

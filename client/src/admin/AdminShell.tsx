import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { adminApi, type Admin } from './api';
import '../styles/admin.css';
import '../styles/clay-admin.css';

export default function AdminShell() {
  // undefined = checking, null = signed out, Admin = signed in
  const [admin, setAdmin] = useState<Admin | null | undefined>(undefined);
  const [signingOut, setSigningOut] = useState(false);
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
      <aside className="admin-side" aria-label="Admin navigation">
        <div className="admin-brand">
          <img src="/assets/logo.webp" alt="AST Education" width={44} height={44} />
          <div>
            <strong>AST Education</strong>
            <span>Admin</span>
          </div>
        </div>
        <nav>
          <NavLink to="/admin" end>Enquiries</NavLink>
          <NavLink to="/admin/content/courses">Courses</NavLink>
          <NavLink to="/admin/content/leadership">Leadership</NavLink>
          <NavLink to="/admin/content/gallery">Gallery</NavLink>
          {admin.role === 'owner' && <NavLink to="/admin/testimonials">Manage Testimonials</NavLink>}
          <NavLink to="/admin/facts">Business facts</NavLink>
          <NavLink to="/admin/videos">Videos</NavLink>
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

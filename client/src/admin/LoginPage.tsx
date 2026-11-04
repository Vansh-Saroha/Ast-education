import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, ApiError } from './api';
import '../styles/admin.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      await adminApi.login(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(Object.fromEntries(Object.entries(err.fields).map(([k, v]) => [k, v[0]])));
      }
      setError(err instanceof ApiError ? err.message : 'We could not sign you in. Please try again.');
      setPassword('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-card admin-login-card" onSubmit={onSubmit} noValidate>
        <img src="/assets/logo.webp" alt="AST Education logo" width={72} height={72} />
        <h1>Owner sign in</h1>
        <p className="hint">Authorised AST Education owner and staff only.</p>

        <label htmlFor="email">Email address</label>
        <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? 'email-error' : undefined} />
        {fieldErrors.email && <p className="err" id="email-error">{fieldErrors.email}</p>}

        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!fieldErrors.password} aria-describedby={fieldErrors.password ? 'password-error' : undefined} />
        {fieldErrors.password && <p className="err" id="password-error">{fieldErrors.password}</p>}

        {error && <p className="err" role="alert">{error}</p>}

        <button className="btn btn-o" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

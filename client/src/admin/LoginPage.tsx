import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, ApiError } from './api';
import InteractiveLamp from './InteractiveLamp';
import '../styles/admin.css';
import '../styles/clay-admin.css';
import '../styles/owner-login.css';

type LoginStage = 'idle' | 'pulling' | 'activated' | 'revealing' | 'login' | 'closing';
const EMAIL_KEY = 'ast-owner-login-email';

function readEmail() {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(EMAIL_KEY) ?? '';
  } catch {
    return '';
  }
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLElement>(null);
  const timersRef = useRef<number[]>([]);
  const activationRef = useRef(false);
  const pullStartedOnRef = useRef(false);
  const [stage, setStage] = useState<LoginStage>('idle');
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion);
  const [email, setEmail] = useState(readEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(Boolean(readEmail()));
  const [showPassword, setShowPassword] = useState(false);
  const [storageNotice, setStorageNotice] = useState('');

  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReduceMotion(motionPreference.matches);
    motionPreference.addEventListener('change', updateMotionPreference);
    return () => {
      motionPreference.removeEventListener('change', updateMotionPreference);
      timersRef.current.forEach(window.clearTimeout);
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (stage !== 'login') {
      panel.setAttribute('inert', '');
      return;
    }
    panel.removeAttribute('inert');
  }, [stage]);

  function startPull() {
    activationRef.current = false;
    pullStartedOnRef.current = stage === 'login';
    setStage('pulling');
  }

  function endPull() {
    setStage((current) => current === 'pulling' ? (pullStartedOnRef.current ? 'login' : 'idle') : current);
  }

  function toggleLamp() {
    if (activationRef.current) return;
    activationRef.current = true;
    timersRef.current.forEach(window.clearTimeout);
    const shouldClose = pullStartedOnRef.current || stage === 'login';
    if (shouldClose) {
      if (document.activeElement instanceof HTMLElement && panelRef.current?.contains(document.activeElement)) {
        document.querySelector<SVGGElement>('.pull-cord')?.focus({ preventScroll: true });
      }
      if (reduceMotion) {
        setStage('idle');
        return;
      }
      setStage('closing');
      timersRef.current = [window.setTimeout(() => setStage('idle'), 720)];
      return;
    }
    if (reduceMotion) {
      setStage('login');
      return;
    }
    setStage('activated');
    timersRef.current = [
      window.setTimeout(() => setStage('revealing'), 420),
      window.setTimeout(() => setStage('login'), 790),
    ];
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      if (rememberEmail) window.localStorage.setItem(EMAIL_KEY, email);
      else window.localStorage.removeItem(EMAIL_KEY);
      setStorageNotice('');
    } catch {
      setStorageNotice('Remember me is unavailable in this browser; sign-in will continue.');
    }
    try {
      await adminApi.login(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(Object.fromEntries(Object.entries(err.fields).map(([key, value]) => [key, value[0]])));
      }
      setError(err instanceof ApiError ? err.message : 'We could not sign you in. Please try again.');
      setPassword('');
    } finally {
      setBusy(false);
    }
  }

  const lampIsActive = stage === 'activated' || stage === 'revealing' || stage === 'login' || (stage === 'pulling' && pullStartedOnRef.current);
  const lampIsLocked = stage === 'activated' || stage === 'revealing' || stage === 'closing';
  const panelIsVisible = stage === 'login' || stage === 'closing' || (stage === 'pulling' && pullStartedOnRef.current);
  const layoutIsOpen = stage === 'login' || stage === 'closing' || (stage === 'pulling' && pullStartedOnRef.current);

  return (
    <main className={`owner-login owner-login--${stage}${lampIsActive ? ' owner-login--lit' : ''}${layoutIsOpen ? ' owner-login--panel-layout' : ''}`}>
      <div className="owner-login__ambient" aria-hidden="true" />
      <div className="owner-login__dust" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i /><i />
      </div>

      <section className="lamp-scene" aria-label="AST Education welcome">
        <header className="lamp-scene__header">
          <a className="owner-brand" href="/" aria-label="AST Education home">
            <img src="/assets/logo.webp" alt="" width={46} height={46} />
            <span>AST <b>EDUCATION</b></span>
          </a>
        </header>

        <div className="lamp-invitation">
          <p className="lamp-invitation__eyebrow">A LITTLE LIGHT GOES A LONG WAY</p>
          <h1>Pull the cord.</h1>
          <p className="lamp-invitation__subheading">Light up your dashboard.</p>
        </div>

        <div className="lamp-visual">
          <InteractiveLamp
            active={lampIsActive}
            locked={lampIsLocked}
            reducedMotion={reduceMotion}
            onPullStart={startPull}
            onPullEnd={endPull}
            onToggle={toggleLamp}
          />
        </div>

        <div className={`pull-instruction${lampIsActive ? ' pull-instruction--active' : ''}`}>
          <span className="pull-instruction__arrow" aria-hidden="true">↓</span>
          <span>{lampIsActive ? 'Pull the cord to close Owner Login' : 'Pull the cord to enter'}</span>
        </div>
        <p className="lamp-scene__footer">A brighter view of AST Education starts here.</p>
      </section>

      <section ref={panelRef} className="owner-login__panel" aria-label="Owner sign in" aria-hidden={!panelIsVisible}>
        <form className="owner-card" onSubmit={onSubmit} noValidate>
          <div className="owner-card__topline">
            <span className="owner-card__overline"><i /> PRIVATE ACCESS</span>
            <span className="owner-card__secure"><i /> SECURE SIGN IN</span>
          </div>
          <h2>Owner Login</h2>
          <p className="owner-card__intro">Welcome back. Your dashboard is ready.</p>

          <label className="owner-field" htmlFor="email">
            <span>Email address</span>
            <span className={`owner-field__input${fieldErrors.email ? ' has-error' : ''}`}>
              <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="5" width="14" height="10" rx="2" /><path d="m4 7 6 4 6-4" /></svg>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                required
              />
            </span>
            {fieldErrors.email && <span className="owner-field__error" id="email-error">{fieldErrors.email}</span>}
          </label>

          <label className="owner-field" htmlFor="password">
            <span>Password</span>
            <span className={`owner-field__input${fieldErrors.password ? ' has-error' : ''}`}>
              <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="9" width="12" height="8" rx="2" /><path d="M7 9V6a3 3 0 0 1 6 0v3" /></svg>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </span>
            {fieldErrors.password && <span className="owner-field__error" id="password-error">{fieldErrors.password}</span>}
          </label>

          <div className="owner-card__options">
            <label className="remember-option">
              <input type="checkbox" checked={rememberEmail} onChange={(event) => setRememberEmail(event.target.checked)} />
              <span className="remember-option__box" aria-hidden="true" />
              Remember me
            </label>
            <span className="owner-card__secure owner-card__secure--mobile"><i /> Secure connection</span>
          </div>

          {error && <p className="owner-card__error" role="alert">{error}</p>}

          <button className="owner-submit" type="submit" disabled={busy}>
            <span>{busy ? 'Signing in…' : 'Access Dashboard'}</span>
            {!busy && <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" /></svg>}
          </button>
          {storageNotice && <p className="owner-card__storage" role="status">{storageNotice}</p>}
          <p className="owner-card__foot">Authorised AST Education owner and staff only.</p>
        </form>
        <p className="owner-login__copyright">© AST Education <span>·</span> Roorkee, Uttarakhand</p>
      </section>
    </main>
  );
}

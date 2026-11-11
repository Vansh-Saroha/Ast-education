import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { publicGet } from '../lib/publicApi';
import { loadingWith, settle, type Loaded } from '../lib/dataState';

type Profile = {
  profileType: string;
  designation: string;
  name?: string;
  qualifications?: string;
  experience?: string;
  biography?: string;
  responsibilities?: string;
  skills?: string;
  teachingManagement?: string;
  achievements?: string;
  visionMission?: string;
  studentMessage?: string;
  quote?: string;
  photo?: { src: string; srcSet: string; width: number; height: number } | null;
};

const OWNER_QUOTE = 'CONFIDENCE AND HARD WORK IS THE BEST MEDICINE TO KILL THE DISEASE CALLED FAILURE. IT WILL MAKE YOU A SUCCESSFUL PERSON.';
const MANAGER_QUOTE = 'EDUCATION IS THE PASSPORT TO THE FUTURE, FOR TOMORROW BELONG TO THOSE WHO PREPARE FOR IT TODAY.';

const PROFILES: Record<string, { role: string; accent: 'gold' | 'blue'; defaults: Profile }> = {
  director: {
    role: 'Director & Chairman',
    accent: 'gold',
    defaults: {
      profileType: 'director',
      designation: 'Director & Chairman',
      name: 'Ankit Chauhan',
      qualifications: 'B.Tech, M.Tech',
      experience: '15 Years of Marketing Experience',
      biography: 'Leading AST Education with a vision of excellence, innovation, and quality education. Bringing 15 years of marketing experience and a strong commitment towards institutional growth and student success.',
      responsibilities: 'Provides institutional direction, supports strategic growth, strengthens educational partnerships, and oversees the long-term development of AST Education.',
      teachingManagement: 'Guides academic and administrative priorities while encouraging innovation, quality standards, and student-focused institutional practices.',
      visionMission: 'To build an institution driven by excellence, innovation, quality education, and meaningful student success.',
      quote: OWNER_QUOTE,
    },
  },
  manager: {
    role: 'General Manager & Teacher',
    accent: 'blue',
    defaults: {
      profileType: 'manager',
      designation: 'General Manager & Teacher',
      name: 'Shalu',
      biography: 'Dedicated to educational excellence and effective institutional management. Passionate about supporting students, maintaining academic standards, and creating a positive learning environment.',
      responsibilities: 'Supports daily institutional operations, coordinates academic activities, assists staff and students, and helps maintain an organized and supportive learning environment.',
      teachingManagement: 'Combines classroom teaching with practical management, student guidance, academic coordination, and consistent communication with the educational team.',
      skills: 'Academic coordination, teaching, student support, communication, administration, and educational management.',
      visionMission: 'To create a positive, disciplined, and student-focused learning environment that encourages academic progress and personal development.',
      quote: MANAGER_QUOTE,
    },
  },
};

export default function LeadershipPage() {
  const [state, setState] = useState<Loaded<Profile[]>>(loadingWith([]));
  const [selected, setSelected] = useState<Profile | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    publicGet<{ items: Profile[] }>('/leadership')
      .then((r) => setState(settle({ ok: true, items: r.items }, [])))
      .catch(() => setState(settle({ ok: false }, [])));
  }, []);

  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [selected]);

  function openProfile(profile: Profile) {
    setSelected(profile);
    requestAnimationFrame(() => dialogRef.current?.showModal());
  }

  function closeProfile() {
    dialogRef.current?.close();
    setSelected(null);
  }

  function onKeyActivate(event: KeyboardEvent<HTMLElement>, profile: Profile) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProfile(profile);
    }
  }

  function tilt(event: PointerEvent<HTMLElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty('--tilt-x', `${y * -8}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${x * 10}deg`);
  }

  function resetTilt(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  }

  const selectedType = selected?.profileType ?? '';
  const selectedConfig = PROFILES[selectedType];

  return (
    <section className="wrap sec leadership-section" aria-labelledby="h-lead">
      <h1 id="h-lead" tabIndex={-1}>Our Leadership</h1>
      <p className="leadership-intro">Guided by visionary leadership and a commitment to student success.</p>
      {state.availability === 'loading' && <p className="hint" role="status">Checking verified profiles…</p>}

      <div className="leadership-grid">
        {Object.entries(PROFILES).map(([type, config]) => {
          const serverProfile = state.items.find((item) => item.profileType === type);
          const profile: Profile = { ...config.defaults, ...serverProfile, profileType: type };
          return (
            <article
              className={`leadership-profile leadership-${config.accent}`}
              key={type}
              role="button"
              tabIndex={0}
              aria-label={`View ${profile.name}'s full profile`}
              onClick={() => openProfile(profile)}
              onKeyDown={(event) => onKeyActivate(event, profile)}
              onPointerMove={tilt}
              onPointerLeave={resetTilt}
            >
              <div className="leadership-particles" aria-hidden="true">
                {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
              </div>
              <div className="leadership-visual">
                <div className="holo-ring holo-ring-one" aria-hidden="true" />
                <div className="holo-ring holo-ring-two" aria-hidden="true" />
                <div className="leadership-frame">
                  {profile.photo && <img src={profile.photo.src} srcSet={profile.photo.srcSet} alt={`Portrait of ${profile.name}`} width={profile.photo.width} height={profile.photo.height} loading="lazy" />}
                </div>
              </div>
              <div className="leadership-card-copy">
                <span>{config.role}</span>
                <h2>{profile.name}</h2>
                <p>{profile.biography}</p>
                <button className="leadership-view" type="button" tabIndex={-1}>View Full Profile <span aria-hidden="true">→</span></button>
              </div>
            </article>
          );
        })}
      </div>

      {state.availability === 'fallback' && <p className="note leadership-fallback" role="status">Showing verified leadership details. Live profile information may be temporarily unavailable.</p>}

      <dialog
        ref={dialogRef}
        className={`leadership-modal leadership-modal-${selectedType === 'manager' ? 'blue' : 'gold'}`}
        aria-labelledby="leadership-modal-title"
        onCancel={(event) => { event.preventDefault(); closeProfile(); }}
        onClose={() => setSelected(null)}
        onClick={(event) => { if (event.target === event.currentTarget) closeProfile(); }}
      >
        {selected && selectedConfig && (
          <div className="leadership-modal-shell">
            <button className="leadership-close" type="button" aria-label="Close profile" onClick={closeProfile}><span aria-hidden="true">×</span></button>
            <div className="leadership-modal-particles" aria-hidden="true">
              {Array.from({ length: 18 }, (_, index) => <span key={index} />)}
            </div>
            <div className="leadership-modal-portrait">
              <div className="holo-ring holo-ring-one" aria-hidden="true" />
              <div className="leadership-frame">
                {selected.photo && <img src={selected.photo.src} srcSet={selected.photo.srcSet} alt={`Large portrait of ${selected.name}`} width={selected.photo.width} height={selected.photo.height} />}
              </div>
            </div>
            <div className="leadership-modal-content">
              <span className="leadership-modal-role">{selected.designation}</span>
              <h2 id="leadership-modal-title">{selected.name}</h2>
              {(selected.qualifications || selected.experience) && (
                <div className="leadership-credentials">
                  {selected.qualifications && <div><span>Education</span><strong>{selected.qualifications}</strong></div>}
                  {selected.experience && <div><span>Experience</span><strong>{selected.experience}</strong></div>}
                </div>
              )}
              <div className="leadership-detail-grid">
                <section><h3>Professional Introduction</h3><p>{selected.biography}</p></section>
                {selected.responsibilities && <section><h3>Responsibilities</h3><p>{selected.responsibilities}</p></section>}
                {selected.teachingManagement && <section><h3>Teaching &amp; Management</h3><p>{selected.teachingManagement}</p></section>}
                {selected.visionMission && <section><h3>Vision &amp; Mission</h3><p>{selected.visionMission}</p></section>}
              </div>
              <blockquote className="leadership-quote">
                <span aria-hidden="true">“</span>
                <p>{selected.quote}</p>
              </blockquote>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}

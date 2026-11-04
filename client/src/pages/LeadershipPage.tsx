import { useEffect, useState } from 'react';
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
  achievements?: string;
  visionMission?: string;
  studentMessage?: string;
  photo?: { src: string; srcSet: string; width: number; height: number } | null;
};

// Roles come from the institute's brief. Names, details and portraits appear only when they are verified,
// and portraits additionally require confirmed photo permission. The server decides; this page only displays.
const ROLES = [
  { type: 'director', title: 'Director / Owner', portraitAlt: 'Portrait of the Director, supplied by the institute' },
  { type: 'manager', title: 'Education Manager', portraitAlt: 'Portrait of the Education Manager, supplied by the institute' },
];

const FIELDS: Array<[keyof Profile, string]> = [
  ['qualifications', 'Educational qualifications'],
  ['experience', 'Professional experience'],
  ['responsibilities', 'Responsibilities'],
  ['skills', 'Skills and expertise'],
  ['biography', 'Biography'],
  ['achievements', 'Achievements'],
  ['visionMission', 'Vision and mission'],
  ['studentMessage', 'Message for students'],
];

export default function LeadershipPage() {
  const [state, setState] = useState<Loaded<Profile[]>>(loadingWith([]));

  useEffect(() => {
    publicGet<{ items: Profile[] }>('/leadership')
      .then((r) => setState(settle({ ok: true, items: r.items }, [])))
      .catch(() => setState(settle({ ok: false }, [])));
  }, []);

  return (
    <section className="wrap sec" aria-labelledby="h-lead">
      <h1 id="h-lead" tabIndex={-1}>Our Leadership</h1>
      {ROLES.map((role) => {
        const p = state.items.find((x) => x.profileType === role.type);
        const headingId = `p-${role.type}`;
        return (
          <article className="card profile" key={role.type} aria-labelledby={headingId} style={{ marginTop: 20 }}>
            {p?.photo ? (
              <img src={p.photo.src} srcSet={p.photo.srcSet} sizes="(min-width: 760px) 300px, 90vw" width={p.photo.width} height={p.photo.height} alt={role.portraitAlt} loading="lazy" />
            ) : (
              <div className="empty" style={{ margin: 0, minHeight: 180 }} aria-hidden="true" />
            )}
            <div>
              <span className="tag">{role.title}</span>
              <h2 id={headingId}>{p?.name || role.title}</h2>
              {state.availability === 'loading' && <p className="hint" role="status">Details are being checked.</p>}
              {state.availability === 'fallback' && <p className="note" role="status">Profile details are temporarily unavailable. Please try again later.</p>}
              {state.availability === 'live' && !p && <p className="ph">Profile details will be published after verification.</p>}
              {state.availability === 'live' && p && (
                <dl>
                  {FIELDS.filter(([k]) => p[k]).map(([k, label]) => (
                    <div key={k}>
                      <dt>{label}</dt>
                      <dd>{String(p[k])}</dd>
                    </div>
                  ))}
                  {FIELDS.every(([k]) => !p[k]) && <dd className="ph">Profile details will be published after verification.</dd>}
                </dl>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicGet } from '../lib/publicApi';
import { APPROVED_LIST_DATE, CATEGORY_LABELS, COURSE_SEED } from '../lib/courses';
import { loadingWith, settle, type Loaded } from '../lib/dataState';

type Course = { id: string; name: string; category: string; description: string };

export default function CoursesPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<Loaded<Course[]>>(loadingWith(COURSE_SEED));
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [active, setActive] = useState<Course | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    publicGet<{ items: Course[] }>('/courses')
      .then((r) => setState(settle({ ok: true, items: r.items }, COURSE_SEED)))
      .catch(() => setState(settle({ ok: false }, COURSE_SEED)));
  }, []);

  const shown = useMemo(
    () => state.items.filter((c) => (!category || c.category === category) && c.name.toLowerCase().includes(query.trim().toLowerCase())),
    [state.items, category, query],
  );

  const open = (c: Course) => {
    setActive(c);
    dialog.current?.showModal();
  };

  return (
    <section className="wrap sec" aria-labelledby="h-courses">
      <h1 id="h-courses" tabIndex={-1}>Courses &amp; Programs</h1>
      <p>Contact us for course fees and detailed information.</p>

      {state.availability === 'loading' && <p className="note" role="status">Checking the latest course list…</p>}
      {state.availability === 'fallback' && (
        <div className="note" role="status">
          <strong>The live course list is unavailable.</strong> You are seeing the approved course list from {APPROVED_LIST_DATE}. Courses may have changed since then, so please contact us to confirm availability before you enrol.
        </div>
      )}

      <label htmlFor="q">Search by course name</label>
      <input id="q" type="search" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="For example: DCA, Tally, Coding" />

      <div className="filters" role="group" aria-label="Filter by category">
        <button className="chip" type="button" aria-pressed={category === ''} onClick={() => setCategory('')}>All courses</button>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button key={key} className="chip" type="button" aria-pressed={category === key} onClick={() => setCategory(key)}>{label}</button>
        ))}
      </div>
      <p className="hint" aria-live="polite">{shown.length} of {state.items.length} courses shown</p>

      {shown.length === 0 ? (
        <div className="empty">
          {state.availability === 'live' && state.items.length === 0
            ? 'No courses are published at the moment. Please contact us for details.'
            : 'No courses match your search. Try another keyword or choose All courses.'}
        </div>
      ) : (
        <div className="grid">
          {shown.map((c) => (
            <article className="card" key={c.id}>
              <p className="tag">{CATEGORY_LABELS[c.category] ?? c.category}</p>
              <h3>{c.name}</h3>
              <p className="ph">{c.description}</p>
              <p className="hint">Contact us for course fees and detailed information.</p>
              <div className="row">
                <button className="btn btn-g" type="button" onClick={() => open(c)}>Learn more</button>
                <button className="btn btn-o" type="button" onClick={() => navigate('/enquiry', { state: { course: c.name } })}>Enquire now</button>
              </div>
            </article>
          ))}
        </div>
      )}

      <dialog ref={dialog} aria-labelledby="cd-title" style={{ border: 0, borderRadius: 12, padding: 0, width: 'min(680px, 94vw)' }}>
        {active && (
          <div style={{ padding: 24 }}>
            <button className="x" type="button" aria-label="Close course details" onClick={() => dialog.current?.close()}>×</button>
            <p className="tag">{CATEGORY_LABELS[active.category] ?? active.category}</p>
            <h2 id="cd-title">{active.name}</h2>
            <p className="ph">{active.description}</p>
            <p>Contact us for course fees and detailed information.</p>
            <div className="row">
              <button className="btn btn-o" type="button" onClick={() => { dialog.current?.close(); navigate('/enquiry', { state: { course: active.name } }); }}>
                Enquire about this course
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}

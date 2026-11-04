import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicGet } from '../lib/publicApi';
import { loadingWith, settle, type Loaded } from '../lib/dataState';

type Photo = { id: string; category: string; caption: string; altText: string; src: string; srcSet: string; width: number; height: number };

const CATEGORIES: Record<string, string> = {
  'institute-building': 'Institute Building',
  classrooms: 'Classrooms',
  'computer-lab': 'Computer Lab',
  faculty: 'Faculty',
  students: 'Students',
  'educational-activities': 'Educational Activities',
  events: 'Events',
};

export default function GalleryPage() {
  const [state, setState] = useState<Loaded<Photo[]>>(loadingWith([]));
  const [category, setCategory] = useState('');
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    publicGet<{ items: Photo[] }>('/gallery')
      .then((r) => setState(settle({ ok: true, items: r.items }, [])))
      .catch(() => setState(settle({ ok: false }, [])));
  }, []);

  const shown = state.items.filter((p) => !category || p.category === category);
  const current = index !== null ? shown[index] : undefined;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) d.close();
  }, [index]);

  const step = (delta: number) =>
    setIndex((i) => (i === null || shown.length === 0 ? null : (i + delta + shown.length) % shown.length));

  return (
    <section className="wrap sec" aria-labelledby="h-gal">
      <h1 id="h-gal" tabIndex={-1}>Gallery</h1>
      <p>Explore institute photographs or <Link to="/videos">watch AST Education videos</Link>.</p>
      {state.availability === 'loading' && <p role="status">Checking the latest photographs…</p>}
      {state.availability === 'fallback' && <div className="note" role="status">Photographs are temporarily unavailable. Please try again later.</div>}
      {state.availability === 'live' && state.items.length === 0 && (
        <>
          <p>Photographs of the institute will appear here once the institute confirms permission to publish them.</p>
          <div className="empty">No verified photographs are published yet. Categories: Institute Building, Classrooms, Computer Lab, Faculty, Students, Educational Activities and Events.</div>
        </>
      )}

      {state.availability === 'live' && state.items.length > 0 && (
        <>
          <div className="filters" role="group" aria-label="Filter photographs by category">
            <button className="chip" type="button" aria-pressed={category === ''} onClick={() => setCategory('')}>All photographs</button>
            {Object.entries(CATEGORIES).map(([key, label]) => (
              <button key={key} className="chip" type="button" aria-pressed={category === key} onClick={() => setCategory(key)}>{label}</button>
            ))}
          </div>
          <p className="hint" aria-live="polite">{shown.length} {shown.length === 1 ? 'photograph' : 'photographs'}</p>
          {shown.length === 0 ? (
            <div className="empty">No photographs in this category yet.</div>
          ) : (
            <div className="grid">
              {shown.map((p, i) => (
                <button key={p.id} type="button" className="thumb" onClick={() => setIndex(i)} aria-label={`Open photograph: ${p.altText}`}>
                  <img src={p.src} srcSet={p.srcSet} sizes="(min-width: 760px) 30vw, 90vw" width={p.width} height={p.height} alt="" loading="lazy" />
                  {p.caption && <span className="hint" style={{ display: 'block', marginTop: 6 }}>{p.caption}</span>}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <dialog
        ref={dialog}
        aria-label="Photograph viewer"
        onClose={() => setIndex(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1);
          if (e.key === 'ArrowLeft') step(-1);
        }}
        style={{ border: 0, borderRadius: 12, padding: 0, width: 'min(860px, 94vw)' }}
      >
        {current && (
          <div style={{ padding: 16 }}>
            <button className="x" type="button" aria-label="Close photograph" onClick={() => dialog.current?.close()}>×</button>
            <img src={current.src} srcSet={current.srcSet} sizes="(min-width: 900px) 860px, 94vw" width={current.width} height={current.height} alt={current.altText} style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
            {current.caption && <p className="hint">{current.caption}</p>}
            <div className="row">
              <button className="btn btn-g" type="button" onClick={() => step(-1)}>Previous</button>
              <button className="btn btn-g" type="button" onClick={() => step(1)}>Next</button>
              <span className="hint">{(index ?? 0) + 1} of {shown.length}</span>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}

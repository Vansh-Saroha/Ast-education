import { useEffect, useState } from 'react';
import { publicGet } from '../lib/publicApi';

type Video = { id: string; title: string; description: string; category: string; isFeatured: boolean; embedUrl: string; thumbnailUrl: string };
const LABELS: Record<string, string> = { 'centre-tour': 'Centre Tour', 'student-feedback': 'Student Feedback', 'parent-feedback': 'Parent Feedback', 'course-demonstration': 'Course Demonstration', 'events-activities': 'Events & Activities', promotional: 'Promotional Videos', achievements: 'Achievements', other: 'Other' };
export default function VideosPage() {
  const [items, setItems] = useState<Video[]>([]);
  const [category, setCategory] = useState('all');
  const [playing, setPlaying] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    publicGet<{ items: Video[] }>('/videos')
      .then(r => { if (active) setItems(r.items); })
      .catch(() => { if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const shown = items.filter(v => category === 'all' || v.category === category);
  return <section className="wrap sec" aria-labelledby="videos-title">
    <h1 id="videos-title">AST Education Videos</h1>
    <p>Centre tours, course demonstrations and student experiences.</p>
    {loading && <div className="note" role="status" aria-live="polite">Loading approved videos…</div>}
    {failed && <div className="note" role="alert">Videos are temporarily unavailable. Please try again later.</div>}
    {!loading && !failed && items.length === 0 && <div className="empty">Videos will appear here after the institute has approved them for publication.</div>}
    {!loading && !failed && items.length > 0 && <>
      <div className="filters" role="group" aria-label="Filter videos"><button className="chip" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>All videos</button>{Object.entries(LABELS).filter(([key]) => items.some(v => v.category === key)).map(([key, label]) => <button key={key} className="chip" aria-pressed={category === key} onClick={() => setCategory(key)}>{label}</button>)}</div>
      <div className="video-public-grid">{shown.map(v => <article className="video-public-card" key={v.id}>
        {playing === v.id ? <iframe src={`${v.embedUrl}?autoplay=1`} title={v.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <button className="video-poster" onClick={() => setPlaying(v.id)} aria-label={`Play ${v.title}`}><img src={v.thumbnailUrl} alt="" loading="lazy" /><span aria-hidden="true">▶</span></button>}
        <div className="video-public-copy"><small>{LABELS[v.category] ?? 'Video'}{v.isFeatured ? ' · Featured' : ''}</small><h2>{v.title}</h2>{v.description && <p>{v.description}</p>}</div>
      </article>)}</div>
    </>}
  </section>;
}

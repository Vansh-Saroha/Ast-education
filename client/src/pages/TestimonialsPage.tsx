import { useEffect, useState } from 'react';
import { publicGet } from '../lib/publicApi';
import { loadingWith, settle, type Loaded } from '../lib/dataState';

type Testimonial = { id: string; studentName: string; courseName: string; feedback: string; rating?: number };
type FeedbackVideo = { id: string; title: string; description: string; category: string; embedUrl: string; thumbnailUrl: string };

export default function TestimonialsPage() {
  const [state, setState] = useState<Loaded<Testimonial[]>>(loadingWith([]));
  const [videos, setVideos] = useState<FeedbackVideo[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    publicGet<{ items: Testimonial[] }>('/testimonials')
      .then((r) => setState(settle({ ok: true, items: r.items }, [])))
      .catch(() => setState(settle({ ok: false }, [])));
    publicGet<{ items: FeedbackVideo[] }>('/videos')
      .then((r) => setVideos(r.items.filter(v => v.category === 'student-feedback' || v.category === 'parent-feedback')))
      .catch(() => setVideos([]));
  }, []);

  return (
    <section className="wrap sec" aria-labelledby="h-test">
      <h1 id="h-test" tabIndex={-1}>Student Testimonials</h1>
      {state.availability === 'loading' && <p role="status">Checking for published experiences…</p>}
      {state.availability === 'fallback' && <div className="note" role="status">Student experiences are temporarily unavailable. Please try again later.</div>}
      {state.availability === 'live' && state.items.length === 0 && videos.length === 0 && (
        <div className="empty">Student experiences will be published after receiving verified consent.</div>
      )}
      {state.availability === 'live' && state.items.length > 0 && (
        <div className="grid">
          {state.items.map((t) => (
            <blockquote className="card" key={t.id} style={{ margin: 0 }}>
              <p>“{t.feedback}”</p>
              <footer>
                <strong>{t.studentName}</strong>
                {t.courseName && <span className="hint"> · {t.courseName}</span>}
                {t.rating && <span className="hint"> · Rated {t.rating} out of 5</span>}
              </footer>
            </blockquote>
          ))}
        </div>
      )}
      {videos.length > 0 && <section className="sec" aria-labelledby="feedback-videos-title">
        <h2 id="feedback-videos-title">Video Experiences</h2>
        <p>Student and parent feedback videos published with consent.</p>
        <div className="video-public-grid">{videos.map(v => <article className="video-public-card" key={v.id}>
          {playing === v.id ? <iframe src={`${v.embedUrl}?autoplay=1`} title={v.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <button className="video-poster" type="button" onClick={() => setPlaying(v.id)} aria-label={`Play ${v.title}`}><img src={v.thumbnailUrl} alt="" loading="lazy" /><span aria-hidden="true">▶</span></button>}
          <div className="video-public-copy"><small>{v.category === 'parent-feedback' ? 'Parent Feedback' : 'Student Feedback'}</small><h2>{v.title}</h2>{v.description && <p>{v.description}</p>}</div>
        </article>)}</div>
      </section>}
    </section>
  );
}

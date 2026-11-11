import { useEffect, useRef, useState, type FormEvent } from 'react';
import { publicGet } from '../lib/publicApi';
import { loadingWith, settle, type Loaded } from '../lib/dataState';

type Testimonial = { id: string; studentName: string; courseName: string; review?: string; feedback?: string; rating?: number; photo?: { id: string; src: string; srcSet: string; width: number; height: number } | null };
type FeedbackVideo = { id: string; title: string; description: string; category: string; embedUrl: string; thumbnailUrl: string };

function StudentPhoto({ name, photo }: { name: string; photo: Testimonial['photo'] }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase() ?? '').join('') || '?';

  useEffect(() => {
    const current = image.current;
    if (!current) return;
    const syncLoadedState = () => {
      if (current.complete && current.naturalWidth > 0) setLoaded(true);
    };
    syncLoadedState();
    const frame = requestAnimationFrame(syncLoadedState);
    return () => cancelAnimationFrame(frame);
  }, [photo?.src]);

  return (
    <div className="testimonial-avatar" role="img" aria-label={`${name} profile`}>
      <span className="testimonial-avatar__initials" aria-hidden="true">{initials}</span>
      {photo?.src && !failed && (
        <img
          ref={image}
          className={`testimonial-photo${loaded ? ' is-loaded' : ''}`}
          src={photo.src}
          srcSet={photo.srcSet || undefined}
          sizes="72px"
          width={photo.width}
          height={photo.height}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export default function TestimonialsPage() {
  const [state, setState] = useState<Loaded<Testimonial[]>>(loadingWith([]));
  const [videos, setVideos] = useState<FeedbackVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState({ studentName: '', courseName: '', rating: 5, review: '', consent: false, website: '' });
  const [photoAssetId, setPhotoAssetId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    publicGet<{ items: Testimonial[] }>('/testimonials')
      .then((r) => setState(settle({ ok: true, items: r.items }, [])))
      .catch(() => setState(settle({ ok: false }, [])));
    publicGet<{ items: FeedbackVideo[] }>('/videos')
      .then((r) => setVideos(r.items.filter(v => v.category === 'student-feedback' || v.category === 'parent-feedback')))
      .catch(() => setVideos([]))
      .finally(() => setVideosLoading(false));
  }, []);

  async function uploadPhoto(file: File) {
    setSubmitError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 6 * 1024 * 1024) {
      setSubmitError('Upload a JPEG, PNG or WebP image smaller than 6 MB.');
      return;
    }
    try {
      const res = await fetch('/api/public/testimonials/upload', {
        method: 'POST',
        headers: { 'Content-Type': file.type, 'X-Filename': encodeURIComponent(file.name), Accept: 'application/json' },
        body: file,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'Could not upload the photo.');
      setPhotoAssetId(data.asset.id);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not upload the photo.');
    }
  }

  async function submitReview(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');
    try {
      const res = await fetch('/api/public/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...form, photoAssetId, consent: form.consent }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'Could not submit your review.');
      setSubmitMessage(data.message);
      setForm({ studentName: '', courseName: '', rating: 5, review: '', consent: false, website: '' });
      setPhotoAssetId(null);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not submit your review.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="wrap sec" aria-labelledby="h-test">
      <h1 id="h-test" tabIndex={-1}>Student Testimonials</h1>
      <div className="row testimonial-submit-row"><button className="btn btn-o" type="button" onClick={() => dialog.current?.showModal()}>Submit Your Review</button></div>
      {(state.availability === 'loading' || videosLoading) && <p role="status">Checking for published experiences…</p>}
      {!videosLoading && state.availability === 'fallback' && <div className="note" role="status">Student experiences are temporarily unavailable. Please try again later.</div>}
      {!videosLoading && state.availability === 'live' && state.items.length === 0 && videos.length === 0 && (
        <div className="empty">Student experiences will be published after receiving verified consent.</div>
      )}
      {state.availability === 'live' && state.items.length > 0 && (
        <div className="grid">
          {state.items.map((t) => (
            <blockquote className="card testimonial-card" key={t.id} style={{ margin: 0 }}>
              <StudentPhoto name={t.studentName} photo={t.photo} />
              <p>“{t.review || t.feedback}”</p>
              <div className="testimonial-stars" aria-label={`${t.rating ?? 0} out of 5 stars`}>{'★'.repeat(t.rating ?? 0)}{'☆'.repeat(5 - (t.rating ?? 0))}</div>
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
      <dialog ref={dialog} aria-labelledby="review-form-title">
        <div className="dlg">
          <button className="x" type="button" aria-label="Close review form" onClick={() => dialog.current?.close()}>&times;</button>
          <h2 id="review-form-title">Submit Your Review</h2>
          <p className="hint">Your experience will be published only after owner approval and consent review.</p>
          <form className="review-form" onSubmit={submitReview}>
            <label>Student Full Name<input value={form.studentName} maxLength={80} required onChange={(e) => setForm({ ...form, studentName: e.target.value })} /></label>
            <label>Course Name<input value={form.courseName} maxLength={80} required onChange={(e) => setForm({ ...form, courseName: e.target.value })} /></label>
            <fieldset className="rating-field"><legend>Star Rating</legend>{[1,2,3,4,5].map(n => <label key={n}><input type="radio" name="rating" value={n} checked={form.rating === n} onChange={() => setForm({ ...form, rating: n })} /><span aria-hidden="true">{n <= form.rating ? '★' : '☆'}</span><span className="sr-only">{n} star{n === 1 ? '' : 's'}</span></label>)}</fieldset>
            <label>Write Your Experience<textarea value={form.review} maxLength={1000} minLength={10} required rows={5} onChange={(e) => setForm({ ...form, review: e.target.value })} /></label>
            <label>Student Photo (Optional)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadPhoto(file); }} /></label>
            <div className="hp" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></label></div>
            <div className="check"><input id="review-consent" type="checkbox" checked={form.consent} required onChange={(e) => setForm({ ...form, consent: e.target.checked })} /><label htmlFor="review-consent">I consent to this review and my optional photo being published after approval.</label></div>
            {submitError && <p className="err" role="alert">{submitError}</p>}
            {submitMessage && <p className="ok" role="status">{submitMessage}</p>}
            <button className="btn btn-o" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Review'}</button>
          </form>
        </div>
      </dialog>
    </section>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { adminApi, formatDate, type AdminTestimonial, type TestimonialStatus } from './api';

const labels: Record<TestimonialStatus, string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

export default function TestimonialsManagePage() {
  const [items, setItems] = useState<AdminTestimonial[]>([]);
  const [stats, setStats] = useState<{ total: number; counts: Record<TestimonialStatus, number> } | null>(null);
  const [filter, setFilter] = useState<TestimonialStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<AdminTestimonial | null>(null);
  const [draft, setDraft] = useState({ studentName: '', courseName: '', rating: 5, review: '' });

  async function load(status = filter) {
    setLoading(true);
    setError('');
    try {
      const [list, totals] = await Promise.all([adminApi.testimonials(status), adminApi.testimonialStats()]);
      setItems(list.items);
      setStats(totals);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load testimonials.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(''); }, []);

  async function setStatus(item: AdminTestimonial, status: TestimonialStatus) {
    setNotice('');
    try {
      await adminApi.updateTestimonial(item.id, { status });
      setNotice(status === 'approved' ? 'Testimonial approved and published.' : status === 'rejected' ? 'Testimonial rejected.' : 'Testimonial moved to pending.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update testimonial.');
    }
  }

  async function remove(item: AdminTestimonial) {
    if (!window.confirm(`Delete the testimonial from ${item.studentName}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteTestimonial(item.id);
      setNotice('Testimonial deleted.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete testimonial.');
    }
  }

  function startEdit(item: AdminTestimonial) {
    setEditing(item);
    setDraft({ studentName: item.studentName, courseName: item.courseName, rating: item.rating, review: item.review });
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await adminApi.updateTestimonial(editing.id, draft);
      setNotice('Testimonial updated.');
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update testimonial.');
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-head"><div><h1>Manage Testimonials</h1><p className="hint">Approve or reject student reviews before publication.</p></div></header>
      <section className="stat-grid" aria-label="Testimonial statistics">
        <button className={`stat ${filter === '' ? 'is-active' : ''}`} type="button" onClick={() => { setFilter(''); void load(''); }}><span>Total Reviews</span><strong>{stats?.total ?? '–'}</strong></button>
        {(['pending', 'approved', 'rejected'] as TestimonialStatus[]).map((status) => (
          <button key={status} className={`stat ${filter === status ? 'is-active' : ''}`} type="button" onClick={() => { setFilter(status); void load(status); }}><span>{labels[status]} Reviews</span><strong>{stats?.counts[status] ?? 0}</strong></button>
        ))}
      </section>
      {notice && <p className="admin-card hint" role="status">{notice}</p>}
      {error && <div className="admin-card" role="alert"><p className="err">{error}</p></div>}
      {loading && <p className="admin-status" role="status">Loading testimonials…</p>}
      {!loading && items.length === 0 && <div className="empty">No testimonials match this view.</div>}
      {!loading && items.length > 0 && <section className="testimonial-admin-list">
        {items.map((item) => <article className="admin-card testimonial-admin-card" key={item.id}>
          <div>
            <span className={`badge badge-${item.status === 'pending' ? 'follow-up' : item.status === 'approved' ? 'admitted' : 'rejected'}`}>{labels[item.status]}</span>
            <h2>{item.studentName}</h2>
            <p className="hint">{item.courseName || 'Course not specified'} · {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</p>
            <p>“{item.review}”</p>
            <small className="hint">Submitted {formatDate(item.createdAt)}</small>
          </div>
          <div className="video-actions">
            {item.status !== 'approved' && <button className="btn btn-o" type="button" onClick={() => void setStatus(item, 'approved')}>Approve</button>}
            {item.status !== 'rejected' && <button className="btn btn-g" type="button" onClick={() => void setStatus(item, 'rejected')}>Reject</button>}
            <button className="btn btn-g" type="button" onClick={() => startEdit(item)}>Edit</button>
            <button className="btn btn-g" type="button" onClick={() => void remove(item)}>Delete</button>
          </div>
        </article>)}
      </section>}
      {editing && <section className="admin-card" aria-labelledby="edit-testimonial"><h2 id="edit-testimonial">Edit testimonial</h2><form className="video-form" onSubmit={saveEdit}>
        <label>Student name<input value={draft.studentName} maxLength={80} onChange={(e) => setDraft({ ...draft, studentName: e.target.value })} /></label>
        <label>Course<input value={draft.courseName} maxLength={80} onChange={(e) => setDraft({ ...draft, courseName: e.target.value })} /></label>
        <label>Rating<select value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} star{n === 1 ? '' : 's'}</option>)}</select></label>
        <label>Experience<textarea value={draft.review} maxLength={1000} rows={5} onChange={(e) => setDraft({ ...draft, review: e.target.value })} /></label>
        <div className="row"><button className="btn btn-o" type="submit">Save changes</button><button className="btn btn-g" type="button" onClick={() => setEditing(null)}>Cancel</button></div>
      </form></section>}
    </div>
  );
}

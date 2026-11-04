import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi, ApiError, formatDate, STATUSES, STATUS_LABELS, type Enquiry, type EnquiryStatus } from './api';

export default function EnquiryDetailPage() {
  const { id = '' } = useParams();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState<EnquiryStatus>('new');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.get(id)
      .then(({ enquiry: e }) => {
        setEnquiry(e);
        setStatus(e.status);
        setNotes(e.internalNotes ?? '');
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else setError('Could not load this enquiry.');
      });
  }, [id]);

  async function save(data: { status?: EnquiryStatus; internalNotes?: string }) {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const { enquiry: updated } = await adminApi.update(id, data);
      setEnquiry(updated);
      setStatus(updated.status);
      setNotes(updated.internalNotes ?? '');
      setMessage('Saved.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (notFound) {
    return (
      <div className="admin-page">
        <h1>Enquiry not found</h1>
        <p>This enquiry may have been removed.</p>
        <Link className="btn btn-g" to="/admin">Back to enquiries</Link>
      </div>
    );
  }
  if (!enquiry) {
    return <p className="admin-status" role="status">{error || 'Loading enquiry…'}</p>;
  }

  const digits = enquiry.mobile.replace(/\D/g, '');
  const waLink = `https://wa.me/91${digits}`;

  return (
    <div className="admin-page">
      <Link className="back" to="/admin">← Back to enquiries</Link>
      <header className="admin-head">
        <div>
          <h1>{enquiry.studentName}</h1>
          <p className="hint">Submitted {formatDate(enquiry.createdAt)}</p>
        </div>
        <span className={`badge badge-${enquiry.status}`}>{STATUS_LABELS[enquiry.status]}</span>
      </header>

      <div className="detail-grid">
        <section className="admin-card" aria-labelledby="d-info">
          <h2 id="d-info">Enquiry details</h2>
          <dl className="facts">
            <dt>Mobile</dt><dd><a href={`tel:+91${digits}`}>{enquiry.mobile}</a></dd>
            <dt>Email</dt><dd>{enquiry.email || <span className="ph">Not provided</span>}</dd>
            <dt>Qualification</dt><dd>{enquiry.qualification}</dd>
            <dt>Interested course</dt><dd>{enquiry.interestedCourse}</dd>
            <dt>Last status change</dt><dd>{enquiry.statusUpdatedAt ? formatDate(enquiry.statusUpdatedAt) : 'No changes yet'}</dd>
          </dl>
          <h3>Student message</h3>
          <p className="message-box">{enquiry.message || 'No message was provided.'}</p>
          <div className="row">
            <a className="btn btn-n" href={`tel:+91${digits}`}>Call</a>
            <a className="btn btn-g" href={waLink} target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>
          </div>
        </section>

        <section className="admin-card" aria-labelledby="d-status">
          <h2 id="d-status">Status and notes</h2>
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value as EnquiryStatus)}>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <div className="row">
            <button className="btn btn-o" type="button" disabled={saving || status === enquiry.status}
              onClick={() => void save({ status })}>
              Update status
            </button>
          </div>

          <label htmlFor="notes">Internal notes (staff only)</label>
          <textarea id="notes" rows={6} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <p className="hint">Up to 2000 characters. Never shown to students.</p>
          <div className="row">
            <button className="btn btn-g" type="button" disabled={saving || notes === (enquiry.internalNotes ?? '')}
              onClick={() => void save({ internalNotes: notes })}>
              Save notes
            </button>
          </div>

          <p role="status" aria-live="polite" className="hint">{message}</p>
          {error && <p className="err" role="alert">{error}</p>}
        </section>
      </div>
    </div>
  );
}

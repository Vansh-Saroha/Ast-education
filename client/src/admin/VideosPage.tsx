import { useEffect, useState, type FormEvent } from 'react';
import { adminApi, type Admin, type AdminVideo, type VideoCategory } from './api';

const CATEGORIES: Array<[VideoCategory, string]> = [
  ['centre-tour', 'Centre Tour'], ['student-feedback', 'Student Feedback'], ['parent-feedback', 'Parent Feedback'],
  ['course-demonstration', 'Course Demonstration'], ['events-activities', 'Events & Activities'],
  ['promotional', 'Promotional Videos'], ['achievements', 'Achievements'], ['other', 'Other'],
];
const blank = { youtubeUrl: '', title: '', description: '', category: 'centre-tour' as VideoCategory, status: 'draft' as const, isFeatured: false, displayOrder: 0, consentStatus: 'pending' as const, consentEvidence: '', isMinor: false, guardianConsentConfirmed: false };

export default function VideosPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [items, setItems] = useState<AdminVideo[]>([]);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const owner = admin?.role === 'owner';

  async function refresh() { const [a, v] = await Promise.all([adminApi.me(), adminApi.videos()]); setAdmin(a.admin); setItems(v.items); }
  useEffect(() => { refresh().catch((e) => setMessage(e.message)); }, []);
  async function addVideo(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    try { await adminApi.createVideo(form); setForm(blank); await refresh(); setMessage('Draft video saved.'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Could not save video.'); }
    finally { setBusy(false); }
  }
  async function change(id: string, data: Partial<AdminVideo>) {
    setBusy(true); setMessage('');
    try { await adminApi.updateVideo(id, data); await refresh(); setMessage('Video updated.'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Could not update video.'); }
    finally { setBusy(false); }
  }
  async function edit(v: AdminVideo) {
    const title = window.prompt('Video title', v.title);
    if (title === null) return;
    const description = window.prompt('Video description', v.description);
    if (description === null) return;
    const youtubeUrl = window.prompt('YouTube URL', v.youtubeUrl);
    if (youtubeUrl === null) return;
    const orderText = window.prompt('Display order (0–9999)', String(v.displayOrder));
    if (orderText === null) return;
    const displayOrder = Number(orderText);
    if (!Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 9999) { setMessage('Display order must be a whole number from 0 to 9999.'); return; }
    await change(v.id, { title: title.trim(), description: description.trim(), youtubeUrl: youtubeUrl.trim(), displayOrder });
  }

  async function remove(id: string) {
    if (!window.confirm('Permanently delete this video record?')) return;
    setBusy(true); try { await adminApi.deleteVideo(id); await refresh(); } catch (e) { setMessage(e instanceof Error ? e.message : 'Delete failed.'); } finally { setBusy(false); }
  }

  return <div className="admin-page">
    <div className="admin-head"><div><h1>Video Management</h1><p className="hint">YouTube-hosted videos · ₹0 additional video hosting cost</p></div></div>
    <div className="admin-card"><h2>Add a YouTube video</h2>
      <p className="hint">Upload the video to AST Education’s YouTube channel first, then paste its URL here. Unlisted videos are not private; anyone with the link can share them.</p>
      <form className="video-form" onSubmit={addVideo}>
        <label>YouTube URL<input required type="url" value={form.youtubeUrl} onChange={e => setForm({ ...form, youtubeUrl: e.target.value })} placeholder="https://youtu.be/xxxxxxxxxxx" /></label>
        <label>Video title<input required minLength={2} maxLength={120} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
        <label>Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as VideoCategory })}>{CATEGORIES.map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></label>
        <label>Description<textarea maxLength={1000} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
        <label>Display order<input type="number" min="0" max="9999" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })} /></label>
        {owner && <><label className="video-check"><input type="checkbox" checked={form.isMinor} onChange={e => setForm({ ...form, isMinor: e.target.checked })} /> Video includes a minor</label><label className="video-check"><input type="checkbox" checked={form.guardianConsentConfirmed} onChange={e => setForm({ ...form, guardianConsentConfirmed: e.target.checked })} /> Parent/guardian consent documented</label></>}
        <button className="btn btn-o" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save as draft'}</button>
      </form>
    </div>
    {message && <p role="status" className="note">{message}</p>}
    <div className="admin-card"><h2>Video library ({items.length})</h2>
      {items.length === 0 ? <p className="empty">No videos added yet.</p> : <div className="video-admin-list">{items.map(v => <article className="video-admin-item" key={v.id}>
        <img src={v.thumbnailUrl} alt="" loading="lazy" />
        <div className="video-admin-info"><h3>{v.title}</h3><p className="hint">{CATEGORIES.find(([k]) => k === v.category)?.[1]} · {v.status} · Consent: {v.consentStatus}{v.isFeatured ? ' · Featured' : ''}</p><a href={v.youtubeUrl} target="_blank" rel="noreferrer">Open on YouTube</a>
          <div className="video-actions">
            <button className="btn btn-g" disabled={busy} onClick={() => edit(v)}>Edit details</button>
            {owner && !v.isMinor && <button className="btn btn-g" disabled={busy} onClick={() => { if (window.confirm('Confirm this video includes a minor?')) change(v.id, { isMinor: true, guardianConsentConfirmed: false, consentStatus: 'pending', consentEvidence: '', status: 'draft', isFeatured: false }); }}>Mark as minor</button>}
            {owner && v.isMinor && !v.guardianConsentConfirmed && <button className="btn btn-g" disabled={busy} onClick={() => { if (window.confirm('Confirm documented parent/guardian consent has been obtained?')) change(v.id, { guardianConsentConfirmed: true }); }}>Confirm guardian consent</button>}
            {owner && v.consentStatus !== 'confirmed' && <button className="btn btn-g" disabled={busy || (v.isMinor && !v.guardianConsentConfirmed)} onClick={() => { const evidence = window.prompt('Consent record/reference (do not enter sensitive personal details):'); if (evidence?.trim()) change(v.id, { consentStatus: 'confirmed', consentEvidence: evidence.trim() }); }}>Confirm consent</button>}
            {owner && v.status !== 'published' && <button className="btn btn-o" disabled={busy || v.consentStatus !== 'confirmed' || (v.isMinor && !v.guardianConsentConfirmed)} onClick={() => change(v.id, { status: 'published' })}>Publish</button>}
            {owner && v.status === 'published' && <button className="btn btn-g" disabled={busy} onClick={() => change(v.id, { status: 'draft' })}>Unpublish</button>}
            {owner && v.status !== 'archived' && <button className="btn btn-g" disabled={busy} onClick={() => change(v.id, { status: 'archived', isFeatured: false })}>Archive</button>}
            {owner && <button className="btn btn-g" disabled={busy} onClick={() => change(v.id, { isFeatured: !v.isFeatured })}>{v.isFeatured ? 'Remove featured' : 'Feature'}</button>}
            {owner && v.consentStatus !== 'withdrawn' && <button className="btn btn-g" disabled={busy} onClick={() => { if (window.confirm('Confirm that consent has been withdrawn? This immediately removes the video from public results.')) change(v.id, { consentStatus: 'withdrawn' }); }}>Withdraw consent</button>}
            {owner && <button className="btn btn-g" disabled={busy} onClick={() => remove(v.id)}>Delete</button>}
          </div>
        </div>
      </article>)}</div>}
    </div>
  </div>;
}

import { useEffect, useState, type FormEvent } from 'react';
import { ApiError, formatDate, request } from './api';
import { useAdminRole } from './useAdminRole';
import { ImageUploader } from './ImageUploader';

type Fact = {
  id: string;
  key: string;
  label: string;
  value: string;
  note: string;
  custom?: boolean;
  publicVisibility?: boolean;
  proofAssetId?: string | null;
  verificationType?: 'owner-confirmed' | 'independently-verified';
  verification: 'pending' | 'verified';
  verificationSource?: 'owner-confirmed' | 'document-checked' | 'none';
  verifiedAt?: string;
};

const SOURCE_LABEL: Record<string, string> = {
  'owner-confirmed': 'Owner-confirmed (not independently checked)',
  'document-checked': 'Independently verified',
};

function keyFromName(name: string): string {
  const words = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return '';
  return (words[0][0].toLowerCase() + words[0].slice(1).toLowerCase() + words.slice(1).map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(''))
    .replace(/^[^a-z]/, '')
    .slice(0, 40);
}

export default function FactsPage() {
  const role = useAdminRole();
  const [facts, setFacts] = useState<Fact[] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savingKey, setSavingKey] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState({
    name: '',
    key: '',
    value: '',
    note: '',
    verificationType: 'owner-confirmed' as 'owner-confirmed' | 'independently-verified',
    publicVisibility: true,
    proofAssetId: null as string | null,
  });

  async function load() {
    try {
      const r = await request<{ items: Fact[] }>('/facts');
      setFacts(r.items);
      setValues(Object.fromEntries(r.items.map((f) => [f.key, f.value])));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load business facts.');
    }
  }

  useEffect(() => { void load(); }, []);

  async function update(key: string, body: Record<string, unknown>) {
    setSavingKey(key);
    setMessage('');
    setError('');
    try {
      const r = await request<{ item: Fact }>(`/facts/${key}`, { method: 'PATCH', body: JSON.stringify(body) });
      setFacts((current) => current?.map((fact) => fact.key === key ? r.item : fact) ?? current);
      setValues((current) => ({ ...current, [key]: r.item.value }));
      setMessage(body.verification === 'verified' ? `${key} is now verified and public.` : `${r.item.label} saved.`);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not save. Please try again.');
    } finally {
      setSavingKey('');
    }
  }

  function openCreate() {
    setCreateError('');
    setForm({ name: '', key: '', value: '', note: '', verificationType: 'owner-confirmed', publicVisibility: true, proofAssetId: null });
    setModalOpen(true);
  }

  async function createFact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError('');
    if (!form.name.trim() || !form.value.trim() || !form.key.trim()) {
      setCreateError('Fact name, key, and value are required.');
      return;
    }
    setCreating(true);
    try {
      const r = await request<{ item: Fact }>('/facts', {
        method: 'POST',
        body: JSON.stringify({
          key: form.key,
          label: form.name.trim(),
          value: form.value.trim(),
          note: form.note.trim(),
          publicVisibility: form.publicVisibility,
          verificationType: form.verificationType,
          proofAssetId: form.proofAssetId,
        }),
      });
      setFacts((current) => [...(current ?? []), r.item].sort((a, b) => a.key.localeCompare(b.key)));
      setValues((current) => ({ ...current, [r.item.key]: r.item.value }));
      setModalOpen(false);
      setMessage(`${r.item.label} was added and is pending verification.`);
    } catch (e) {
      setCreateError(e instanceof ApiError ? e.message : 'Could not add the fact.');
    } finally {
      setCreating(false);
    }
  }

  async function deleteFact(fact: Fact) {
    if (!window.confirm(`Delete "${fact.label}"? This cannot be undone.`)) return;
    setSavingKey(fact.key);
    setError('');
    try {
      await request(`/facts/${fact.key}`, { method: 'DELETE' });
      setFacts((current) => current?.filter((item) => item.key !== fact.key) ?? current);
      setValues((current) => {
        const next = { ...current };
        delete next[fact.key];
        return next;
      });
      setMessage(`${fact.label} was deleted.`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not delete the fact.');
    } finally {
      setSavingKey('');
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-head facts-head">
        <div>
          <h1>Business facts</h1>
          <p className="hint">A fact appears on the public website only when it is verified and publicly visible.</p>
        </div>
        {role === 'owner' && <button className="btn btn-o" type="button" onClick={openCreate}>+ Add New Fact</button>}
      </header>
      {message && <p className="admin-card hint" role="status">{message}</p>}
      {error && <div className="admin-card" role="alert"><p className="err">{error}</p></div>}
      {!facts && !error && <p className="admin-status" role="status">Loading…</p>}
      {facts && (
        <section className="admin-card table-card">
          {facts.length === 0 ? (
            <div className="empty"><strong>No business facts yet.</strong><p>Add a fact to start building your verified public information.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="enq-table">
                <caption className="sr-only">Business facts and verification status</caption>
                <thead><tr><th scope="col">Fact</th><th scope="col">Value</th><th scope="col">Public status</th><th scope="col">Notes</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {facts.map((f) => {
                    const visible = f.publicVisibility !== false;
                    return (
                      <tr key={f.key}>
                        <td data-label="Fact"><strong>{f.label}</strong><br /><span className="hint">{f.key}{f.custom ? ' · Custom' : ''}</span></td>
                        <td data-label="Value">
                          <label htmlFor={`v-${f.key}`} className="sr-only">Value for {f.label}</label>
                          <input id={`v-${f.key}`} value={values[f.key] ?? ''} maxLength={300} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
                        </td>
                        <td data-label="Public status">
                          {!visible ? <span className="badge badge-rejected">Hidden</span> : f.verification === 'verified'
                            ? <span className="badge badge-admitted">Verified and shown</span>
                            : <span className="badge badge-follow-up">Pending, hidden</span>}
                          {f.verification === 'verified' && f.verificationSource && SOURCE_LABEL[f.verificationSource] && <p className="hint">Source: {SOURCE_LABEL[f.verificationSource]}</p>}
                          {f.verifiedAt && <p className="hint">Verified {formatDate(f.verifiedAt)}</p>}
                        </td>
                        <td data-label="Notes" className="msg">{f.note || 'No private notes.'}</td>
                        <td data-label="Actions">
                          <div className="row facts-actions">
                            <button className="btn btn-g" type="button" disabled={savingKey === f.key || (values[f.key] ?? '') === f.value} onClick={() => update(f.key, { value: values[f.key] ?? '' })}>
                              {savingKey === f.key ? 'Saving…' : 'Save value'}
                            </button>
                            {role === 'owner' && f.verification === 'pending' && (
                              <button className="btn btn-o" type="button" disabled={savingKey === f.key || !f.value} onClick={() => update(f.key, {
                                verification: 'verified',
                                verificationSource: f.verificationType === 'independently-verified' ? 'document-checked' : 'owner-confirmed',
                              })}>Mark verified</button>
                            )}
                            {role === 'owner' && f.verification === 'verified' && (
                              <button className="btn btn-g" type="button" disabled={savingKey === f.key || !visible} onClick={() => update(f.key, { publicVisibility: false })}>Hide</button>
                            )}
                            {role === 'owner' && !visible && (
                              <button className="btn btn-g" type="button" disabled={savingKey === f.key || f.verification !== 'verified'} onClick={() => update(f.key, { publicVisibility: true })}>Show</button>
                            )}
                            {role === 'owner' && f.custom && (
                              <button className="btn btn-danger" type="button" disabled={savingKey === f.key} onClick={() => deleteFact(f)}>Delete</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {role === 'staff' && <p className="hint">Only the owner can verify, change visibility, add, or delete custom facts.</p>}
        </section>
      )}

      {modalOpen && (
        <div className="fact-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <section className="fact-modal" role="dialog" aria-modal="true" aria-labelledby="add-fact-title">
            <header className="fact-modal-head">
              <div><p className="hint">Business Facts</p><h2 id="add-fact-title">Add New Fact</h2></div>
              <button className="modal-close" type="button" aria-label="Close" onClick={() => setModalOpen(false)}>×</button>
            </header>
            <form className="fact-form" onSubmit={createFact}>
              <label>Fact Name<input value={form.name} maxLength={80} required onChange={(e) => {
                const name = e.target.value;
                setForm((current) => ({ ...current, name, key: keyFromName(name) }));
              }} placeholder="e.g. GST Number" /></label>
              <label>Fact Key<input value={form.key} maxLength={40} pattern="[a-z][a-zA-Z0-9]{1,39}" required onChange={(e) => setForm((current) => ({ ...current, key: e.target.value }))} /><span className="hint">Automatically generated; letters and numbers only.</span></label>
              <label className="field-wide">Fact Value<input value={form.value} maxLength={300} required onChange={(e) => setForm((current) => ({ ...current, value: e.target.value }))} /></label>
              <label className="field-wide">Description / Notes<textarea value={form.note} maxLength={500} rows={3} onChange={(e) => setForm((current) => ({ ...current, note: e.target.value }))} /></label>
              <label>Verification Type<select value={form.verificationType} onChange={(e) => setForm((current) => ({ ...current, verificationType: e.target.value as typeof current.verificationType }))}>
                <option value="owner-confirmed">Owner Confirmed</option>
                <option value="independently-verified">Independently Verified</option>
              </select></label>
              <label className="visibility-toggle"><span>Public Visibility</span><input type="checkbox" checked={form.publicVisibility} onChange={(e) => setForm((current) => ({ ...current, publicVisibility: e.target.checked }))} /><span>{form.publicVisibility ? 'Visible when verified' : 'Hidden from public'}</span></label>
              <div className="field-wide">
                <ImageUploader purpose="fact-proof" label="Supporting Proof (optional)" value={form.proofAssetId} nullable onChange={(proofAssetId) => setForm((current) => ({ ...current, proofAssetId }))} hint="Private proof only. It will not be exposed on the public website." />
              </div>
              {createError && <p className="err field-wide" role="alert">{createError}</p>}
              <div className="fact-modal-actions field-wide">
                <button className="btn btn-g" type="button" onClick={() => setModalOpen(false)} disabled={creating}>Cancel</button>
                <button className="btn btn-o" type="submit" disabled={creating}>{creating ? 'Adding…' : 'Add Fact'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

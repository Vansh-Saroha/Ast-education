import { useEffect, useState } from 'react';
import { ApiError, formatDate, request } from './api';
import { useAdminRole } from './useAdminRole';

type Fact = { id: string; key: string; label: string; value: string; note: string; verification: 'pending' | 'verified'; verificationSource?: 'owner-confirmed' | 'document-checked' | 'none'; verifiedAt?: string };

const SOURCE_LABEL: Record<string, string> = {
  'owner-confirmed': 'Owner-confirmed (not independently checked)',
  'document-checked': 'Checked against a document',
};

export default function FactsPage() {
  const role = useAdminRole();
  const [facts, setFacts] = useState<Fact[] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  async function update(key: string, body: { value?: string; verification?: 'pending' | 'verified' }) {
    setMessage('');
    setError('');
    try {
      await request(`/facts/${key}`, { method: 'PATCH', body: JSON.stringify(body) });
      setMessage(body.verification === 'verified' ? `${key} is now verified and public.` : `${key} saved. It is hidden from the public site until verified.`);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not save. Please try again.');
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <div>
          <h1>Business facts</h1>
          <p className="hint">A fact appears on the public website only when it is verified. Changing a value returns it to pending.</p>
        </div>
      </header>
      {message && <p className="admin-card hint" role="status">{message}</p>}
      {error && <div className="admin-card" role="alert"><p className="err">{error}</p></div>}
      {!facts && !error && <p className="admin-status" role="status">Loading…</p>}
      {facts && (
        <section className="admin-card table-card">
          <div className="table-wrap">
            <table className="enq-table">
              <caption className="sr-only">Business facts and verification status</caption>
              <thead>
                <tr><th scope="col">Fact</th><th scope="col">Value</th><th scope="col">Public status</th><th scope="col">Notes</th><th scope="col"><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody>
                {facts.map((f) => (
                  <tr key={f.key}>
                    <td data-label="Fact"><strong>{f.label}</strong><br /><span className="hint">{f.key}</span></td>
                    <td data-label="Value">
                      <label htmlFor={`v-${f.key}`} className="sr-only">Value for {f.label}</label>
                      <input id={`v-${f.key}`} value={values[f.key] ?? ''} maxLength={300} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
                    </td>
                    <td data-label="Public status">
                      {f.verification === 'verified'
                        ? <span className="badge badge-admitted">Verified and shown</span>
                        : <span className="badge badge-follow-up">Pending, hidden</span>}
                      {f.verification === 'verified' && f.verificationSource && SOURCE_LABEL[f.verificationSource] && <p className="hint">Source: {SOURCE_LABEL[f.verificationSource]}</p>}
                      {f.verifiedAt && <p className="hint">Verified {formatDate(f.verifiedAt)}</p>}
                    </td>
                    <td data-label="Notes" className="msg">{f.note}</td>
                    <td data-label="Actions">
                      <div className="row" style={{ marginTop: 0 }}>
                        <button className="btn btn-g" type="button" disabled={(values[f.key] ?? '') === f.value} onClick={() => update(f.key, { value: values[f.key] ?? '' })}>Save value</button>
                        {role === 'owner' && f.verification === 'pending' && (
                          <button className="btn btn-o" type="button" disabled={!f.value} onClick={() => update(f.key, { verification: 'verified' })}>Mark verified</button>
                        )}
                        {role === 'owner' && f.verification === 'verified' && (
                          <button className="btn btn-g" type="button" onClick={() => update(f.key, { verification: 'pending' })}>Hide</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {role === 'staff' && <p className="hint">Only the owner can verify or hide facts.</p>}
        </section>
      )}
    </div>
  );
}

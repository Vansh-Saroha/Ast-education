import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, request, formatDate } from './api';
import { CONTENT_TYPES, COMMON_FIELDS, type FieldDef } from './contentConfig';
import { useAdminRole } from './useAdminRole';
import { ImageUploader } from './ImageUploader';

type Item = Record<string, unknown> & { id: string };
type Draft = Record<string, string | number | boolean>;

const STATUS_LABEL: Record<string, string> = { draft: 'Draft', published: 'Published', archived: 'Archived' };

export default function ContentPage() {
  const { type = '' } = useParams();
  const def = CONTENT_TYPES[type];
  const role = useAdminRole();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Item | 'new' | null>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  async function load() {
    try {
      const r = await request<{ items: Item[] }>(`/${type}`);
      setItems(r.items);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load items.');
    }
  }

  useEffect(() => {
    setItems(null);
    setEditing(null);
    if (def) void load();
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!def) return <div className="admin-page"><h1>Unknown content type</h1><Link to="/admin">Back to enquiries</Link></div>;

  const allFields: FieldDef[] = [...def.fields, ...COMMON_FIELDS];

  function startEdit(item: Item | 'new') {
    setNotice('');
    setFieldErrors({});
    setEditing(item);
    const base: Draft = { status: 'draft', displayOrder: 0 };
    const source: Record<string, unknown> = item === 'new' ? {} : item;
    for (const f of allFields) {
      const v = source[f.key];
      base[f.key] = f.kind === 'checkbox' ? Boolean(v) : v == null ? '' : (v as string | number);
    }
    setDraft(base);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (saving || !editing) return;
    setSaving(true);
    setFieldErrors({});
    setNotice('');
    const body: Record<string, unknown> = {};
    for (const f of allFields) {
      const v = draft[f.key];
      if (f.kind === 'image') {
        body[f.key] = v ? String(v) : null;
        continue;
      }
      if (f.kind === 'number') {
        if (v !== '' && v !== undefined) body[f.key] = Number(v);
      } else if (f.kind === 'checkbox') {
        body[f.key] = Boolean(v);
      } else if (typeof v === 'string' && (v.trim() !== '' || f.key in (editing === 'new' ? {} : editing))) {
        body[f.key] = v.trim();
      }
    }
    if (draft.verification === 'verified' || draft.verification === 'pending') body.verification = draft.verification;
    try {
      if (editing === 'new') {
        await request(`/${type}`, { method: 'POST', body: JSON.stringify(body) });
        setNotice(`Added. It stays in draft until you publish it, and stays hidden until verified.`);
      } else {
        await request(`/${type}/${editing.id}`, { method: 'PATCH', body: JSON.stringify(body) });
        setNotice('Saved.');
      }
      setEditing(null);
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(Object.fromEntries(Object.entries(err.fields).map(([k, v]) => [k, v[0]])));
      }
      setNotice(err instanceof ApiError ? err.message : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(it: Item) {
    if (!window.confirm('Delete this photograph and its image? This cannot be undone.')) return;
    try {
      await request(`/${type}/${it.id}`, { method: 'DELETE' });
      setNotice('Deleted. The image was removed as well.');
      await load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not delete. Please try again.');
    }
  }

  const canVerify = role === 'owner';

  return (
    <div className="admin-page">
      <header className="admin-head">
        <div>
          <h1>{def.title}</h1>
          <p className="hint">Only published and verified items appear on the public website.</p>
        </div>
        <button className="btn btn-o" type="button" onClick={() => startEdit('new')}>Add {def.singular}</button>
      </header>

      {notice && <p className="admin-card hint" role="status">{notice}</p>}
      {error && <div className="admin-card" role="alert"><p className="err">{error}</p></div>}
      {!items && !error && <p className="admin-status" role="status">Loading…</p>}

      {items && items.length === 0 && <div className="empty">No {def.title.toLowerCase()} yet.</div>}

      {items && items.length > 0 && (
        <section className="admin-card table-card">
          <div className="table-wrap">
            <table className="enq-table">
              <caption className="sr-only">{def.title}</caption>
              <thead>
                <tr>
                  {def.columns.map((c) => <th key={c.key} scope="col">{c.label}</th>)}
                  <th scope="col">Status</th>
                  <th scope="col">Verification</th>
                  <th scope="col">Updated</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    {def.columns.map((c) => <td key={c.key} data-label={c.label}>{String(it[c.key] ?? '') || <span className="ph">Not set</span>}</td>)}
                    <td data-label="Status"><span className={`badge ${it.status === 'published' ? 'badge-admitted' : 'badge-contacted'}`}>{STATUS_LABEL[String(it.status)] ?? String(it.status)}</span></td>
                    <td data-label="Verification">
                      {it.verification === 'verified'
                        ? <span className="badge badge-admitted">Verified</span>
                        : <span className="badge badge-follow-up">Pending verification</span>}
                    </td>
                    <td data-label="Updated">{it.updatedAt ? formatDate(String(it.updatedAt)) : '–'}</td>
                    <td data-label="Actions">
                      <div className="row" style={{ marginTop: 0 }}>
                        <button className="btn btn-g" type="button" onClick={() => startEdit(it)}>Edit</button>
                        {type === 'gallery' && role === 'owner' && (
                          <button className="btn btn-g" type="button" onClick={() => void removeItem(it)}>Delete with image</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {editing && (
        <section className="admin-card" aria-labelledby="editor-title">
          <h2 id="editor-title">{editing === 'new' ? `New ${def.singular}` : `Edit ${def.singular}`}</h2>
          <form onSubmit={save} noValidate className="editor">
            {allFields.map((f) => (
              <FieldInput
                key={f.key}
                def={f}
                value={draft[f.key]}
                error={fieldErrors[f.key]}
                disabled={f.key === 'photoPermission' && role !== 'owner'}
                onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
              />
            ))}

            <div>
              <label htmlFor="verification">Verification</label>
              <select id="verification" disabled={!canVerify} value={String(draft.verification ?? '')} onChange={(e) => setDraft((d) => ({ ...d, verification: e.target.value }))}>
                <option value="">No change</option>
                <option value="verified">Mark as verified</option>
                <option value="pending">Mark as pending</option>
              </select>
              <p className="hint">{canVerify ? 'Only verify information you have checked against the source.' : 'Only the owner can verify information. Edits return items to pending until the owner verifies them.'}</p>
            </div>

            <div className="row">
              <button className="btn btn-o" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              <button className="btn btn-g" type="button" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

function FieldInput({ def, value, error, onChange, disabled }: { def: FieldDef; value: string | number | boolean | undefined; error?: string; onChange: (v: string | number | boolean) => void; disabled?: boolean }) {
  const id = `f-${def.key}`;
  const describedBy = [def.hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  const common = { id, 'aria-invalid': !!error, 'aria-describedby': describedBy, disabled };

  if (def.kind === 'image') {
    return (
      <ImageUploader
        purpose={def.purpose ?? 'gallery'}
        label={def.label}
        value={value ? String(value) : null}
        nullable={!def.required}
        disabled={disabled}
        hint={def.hint}
        onChange={(assetId) => onChange(assetId ?? '')}
      />
    );
  }

  if (def.kind === 'checkbox') {
    return (
      <div className="check">
        <input type="checkbox" {...common} checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        <label htmlFor={id} style={{ margin: 0, fontWeight: 400 }}>{def.label}</label>
        {error && <p className="err" id={`${id}-error`} role="alert">{error}</p>}
      </div>
    );
  }
  return (
    <div>
      <label htmlFor={id}>{def.label}{def.required && <span className="hint"> (required)</span>}</label>
      {def.kind === 'textarea' && <textarea rows={4} maxLength={def.max} {...common} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />}
      {def.kind === 'text' && <input maxLength={def.max} {...common} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />}
      {def.kind === 'number' && <input type="number" min={def.min} max={def.max} {...common} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />}
      {def.kind === 'select' && (
        <select {...common} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
          {!def.required && <option value="">Not set</option>}
          {def.options?.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      )}
      {def.hint && <p className="hint" id={`${id}-hint`}>{def.hint}</p>}
      {error && <p className="err" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { COURSE_OPTIONS } from '../lib/enquiry';
import { adminApi, formatDate, STATUSES, STATUS_LABELS, type Enquiry } from './api';

type ListState = { items: Enquiry[]; page: number; pages: number; total: number } | null;

export default function DashboardPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [list, setList] = useState<ListState>(null);
  const [stats, setStats] = useState<{ total: number; counts: Record<string, number> } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const current = (key: string) => params.get(key) ?? '';

  // Update the URL so filters survive refresh and can be shared between staff.
  const setParam = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  }, [params, setParams]);

  // Debounce the search box so the server is not queried on every keystroke.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (search.trim() !== (params.get('q') ?? '')) setParam('q', search.trim());
    }, 300);
    return () => window.clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const query = params.toString();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [l, s] = await Promise.all([adminApi.list(new URLSearchParams(query)), adminApi.stats()]);
      setList(l);
      setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load enquiries.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  const clearFilters = () => {
    setSearch('');
    setParams(new URLSearchParams());
  };

  return (
    <div className="admin-page">
      <header className="admin-head">
        <div>
          <h1>Admission enquiries</h1>
          <p className="hint">Newest first. Select a student to view details and update status.</p>
        </div>
      </header>

      <section className="stat-grid" aria-label="Enquiry totals by status">
        <button type="button" className={`stat ${!current('status') ? 'is-active' : ''}`} onClick={() => setParam('status', '')}>
          <span>All</span><strong>{stats?.total ?? '–'}</strong>
        </button>
        {STATUSES.map((s) => (
          <button key={s} type="button" className={`stat ${current('status') === s ? 'is-active' : ''}`} onClick={() => setParam('status', s)}>
            <span>{STATUS_LABELS[s]}</span><strong>{stats?.counts[s] ?? '–'}</strong>
          </button>
        ))}
      </section>

      <section className="admin-card filters" aria-label="Filter enquiries">
        <div className="field-wide">
          <label htmlFor="q">Search name, mobile, email or course</label>
          <input id="q" type="search" value={search} maxLength={80} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div>
          <label htmlFor="course">Course</label>
          <select id="course" value={current('course')} onChange={(e) => setParam('course', e.target.value)}>
            <option value="">All courses</option>
            {COURSE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="status">Status</label>
          <select id="status" value={current('status')} onChange={(e) => setParam('status', e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="from">From</label>
          <input id="from" type="date" value={current('from')} onChange={(e) => setParam('from', e.target.value)} />
        </div>
        <div>
          <label htmlFor="to">To</label>
          <input id="to" type="date" value={current('to')} onChange={(e) => setParam('to', e.target.value)} />
        </div>
        <div className="filters-actions">
          <button className="btn btn-g" type="button" onClick={clearFilters}>Clear filters</button>
        </div>
      </section>

      {error && (
        <div className="admin-card" role="alert">
          <p className="err">{error}</p>
          <button className="btn btn-g" type="button" onClick={() => void load()}>Try again</button>
        </div>
      )}

      {!error && loading && !list && <p className="admin-status" role="status">Loading enquiries…</p>}

      {list && (
        <section className="admin-card table-card" aria-live="polite" aria-busy={loading}>
          <p className="hint">{list.total} {list.total === 1 ? 'enquiry' : 'enquiries'} found</p>
          {list.items.length === 0 ? (
            <div className="empty">No enquiries match these filters. Try a different search or clear the filters.</div>
          ) : (
            <div className="table-wrap">
              <table className="enq-table">
                <caption className="sr-only">Admission enquiries</caption>
                <thead>
                  <tr>
                    <th scope="col">Student</th>
                    <th scope="col">Mobile</th>
                    <th scope="col">Course</th>
                    <th scope="col">Message</th>
                    <th scope="col">Submitted</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {list.items.map((e) => (
                    <tr key={e.id}>
                      <td data-label="Student"><Link to={`/admin/enquiries/${e.id}`}>{e.studentName}</Link></td>
                      <td data-label="Mobile">{e.mobile}</td>
                      <td data-label="Course">{e.interestedCourse}</td>
                      <td data-label="Message" className="msg">{e.message || <span className="ph">No message</span>}</td>
                      <td data-label="Submitted">{formatDate(e.createdAt)}</td>
                      <td data-label="Status"><span className={`badge badge-${e.status}`}>{STATUS_LABELS[e.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {list.pages > 1 && (
            <nav className="pager" aria-label="Pagination">
              <button className="btn btn-g" type="button" disabled={list.page <= 1} onClick={() => setParam('page', String(list.page - 1))}>Previous</button>
              <span>Page {list.page} of {list.pages}</span>
              <button className="btn btn-g" type="button" disabled={list.page >= list.pages} onClick={() => setParam('page', String(list.page + 1))}>Next</button>
            </nav>
          )}
        </section>
      )}
    </div>
  );
}

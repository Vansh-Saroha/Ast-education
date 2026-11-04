import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import snapshot from '../seo/verified-facts.json';
import { publicGet } from './publicApi';
import { resolveFacts, type ApiResult, type FactsState } from './dataState';

const SNAP = snapshot as Record<string, unknown> & { snapshotDate: string };
const snapshotFacts: Record<string, string> = Object.fromEntries(
  Object.entries(SNAP)
    .filter(([k]) => k !== 'snapshotDate')
    .map(([k, v]) => [k, (v as { value: string }).value]),
);

// Before the server answers, the approved snapshot is shown and labelled "checking". It is never labelled live.
const INITIAL: FactsState = { availability: 'loading', facts: snapshotFacts, snapshotDate: SNAP.snapshotDate };

export const FactsContext = createContext<FactsState>(INITIAL);

export function FactsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FactsState>(INITIAL);

  useEffect(() => {
    publicGet<{ items: Array<{ key: string; value: string }> }>('/facts')
      .then((r): ApiResult<Array<{ key: string; value: string }>> => ({ ok: true, items: r.items }))
      .catch((): ApiResult<Array<{ key: string; value: string }>> => ({ ok: false }))
      .then((result) => setState(resolveFacts(result, snapshotFacts, SNAP.snapshotDate)));
  }, []);

  return <FactsContext.Provider value={state}>{children}</FactsContext.Provider>;
}

export const useFacts = (): FactsState => useContext(FactsContext);

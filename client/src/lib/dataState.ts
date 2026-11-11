// Records where a piece of displayed data came from. Pages use this to tell visitors the truth:
// - "loading": the page has not heard back yet. Placeholders are neutral and make no claim.
// - "live": the server answered. The server's list is shown exactly, even when it is empty.
// - "fallback": the server could not be reached. The approved fallback is shown with a clear notice.
// Nothing here marks fallback data as current.

export type Availability = 'loading' | 'live' | 'fallback';

export interface Loaded<T> {
  availability: Availability;
  items: T;
}

export type ApiResult<T> = { ok: true; items: T } | { ok: false };

/** Before the first answer. The placeholder is shown with a "checking" message. */
export function loadingWith<T>(placeholder: T): Loaded<T> {
  return { availability: 'loading', items: placeholder };
}

/** After the server answers or fails. A live answer always wins, even when it is empty. */
export function settle<T>(result: ApiResult<T>, fallback: T): Loaded<T> {
  return result.ok ? { availability: 'live', items: result.items } : { availability: 'fallback', items: fallback };
}

export interface FactsState {
  availability: Availability;
  facts: Record<string, string>;
  snapshotDate: string;
  items?: PublicFact[];
}

export interface PublicFact {
  key: string;
  label: string;
  value: string;
  source?: 'owner-confirmed' | 'document-checked' | 'none';
  custom?: boolean;
}

/**
 * Resolves business facts. Live facts replace the approved snapshot entirely, so a fact the owner hid
 * disappears from the site. The snapshot is used only when the server cannot be reached.
 */
export function resolveFacts(
  result: ApiResult<PublicFact[]>,
  snapshotFacts: Record<string, string>,
  snapshotDate: string,
): FactsState {
  if (!result.ok) return { availability: 'fallback', facts: snapshotFacts, snapshotDate };
  return {
    availability: 'live',
    facts: Object.fromEntries(result.items.map((i) => [i.key, i.value])),
    snapshotDate,
    items: result.items,
  };
}

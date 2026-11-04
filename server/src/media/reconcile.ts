import type { StoredObjectInfo } from './storage.js';
import { isStorageKey } from './format.js';

export interface OrphanGroup {
  storageId: string;
  keys: string[];
  newest: Date;
}

export const storageIdOf = (key: string): string | null => {
  if (!isStorageKey(key)) return null;
  return key.split('/')[1];
};

/**
 * Stored files that no database record describes and that are older than the cutoff.
 * Recent files are kept, because an upload may be in progress between writing files and saving its record.
 */
export function findOrphanedObjects(objects: StoredObjectInfo[], knownStorageIds: ReadonlySet<string>, cutoff: Date): OrphanGroup[] {
  const groups = new Map<string, { keys: string[]; newest: Date }>();
  for (const o of objects) {
    const id = storageIdOf(o.key);
    if (!id) continue;
    const g = groups.get(id) ?? { keys: [], newest: new Date(0) };
    g.keys.push(o.key);
    if (o.modified > g.newest) g.newest = o.modified;
    groups.set(id, g);
  }
  return [...groups.entries()]
    .filter(([id, g]) => !knownStorageIds.has(id) && g.newest < cutoff)
    .map(([storageId, g]) => ({ storageId, keys: g.keys, newest: g.newest }));
}

/** The image a record stopped using when its reference changed. Null when nothing was released. */
export function releasedImage(previousId: string | null, nextId: string | null): string | null {
  return previousId && previousId !== nextId ? previousId : null;
}

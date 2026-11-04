// Read-only requests to the public content API. Responses are never trusted for anything beyond display.
export async function publicGet<T>(path: string): Promise<T> {
  const res = await fetch(`/api/public${path}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return (await res.json()) as T;
}

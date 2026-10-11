export async function apiFetch<T>(
  url: string,
  init?: RequestInit,
  fallback = 'Request failed'
): Promise<T> {
  const res = await fetch(url, init);
  const data = (await res.json().catch(() => null)) as { error?: unknown } | null;
  if (!res.ok) {
    const message = typeof data?.error === 'string' && data.error ? data.error : fallback;
    throw new Error(message);
  }
  return data as T;
}

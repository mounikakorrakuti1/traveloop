type CacheItem<T> = {
  expiresAt: number;
  value: T;
};

const cache = new Map<string, CacheItem<unknown>>();

export const getCached = <T>(key: string): T | null => {
  const item = cache.get(key);
  if (!item || item.expiresAt < Date.now()) {
    if (item) cache.delete(key);
    return null;
  }
  return item.value as T;
};

export const setCached = <T>(key: string, value: T, ttlMs: number): T => {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
};

export const cacheTtl = {
  short: 1000 * 60 * 10,
  medium: 1000 * 60 * 30,
  long: 1000 * 60 * 60 * 6
} as const;

import { cache } from "react";
import { MenuType } from "@/types/model";

export const API_BASE = "https://pos-outdoor.tsdsolution.net/api/DriverController";
export const IMG_BASE_URL = "https://pos-outdoor.tsdsolution.net/assets/uploads/";

export interface StoreSettings {
  logo?: string;
  site_name?: string;
  slide_Show?: string;
  symbol?: string;
  language?: string;
}

export interface SlideImage {
  name: string;
}

export interface OrderConfigIcon {
  url: string;
  logo: string;
}

export interface OrderConfig {
  hero?: string;
  icon?: OrderConfigIcon[];
  phone_num?: string;
  googlemap?: string;
  telegram?: string;
  tiktok?: string;
}

export interface RawTableRecord {
  id: string;
  name: string;
  floor_id?: string;
  active?: string;
}

export function parseSlideShow(slideShow?: string): SlideImage[] {
  if (!slideShow) return [];
  try {
    const corrected = slideShow.replace(/,\s*]$/, "]");
    const parsed = JSON.parse(corrected);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
//test
type CacheEntry<T> = {
  data: T;
  fetchedAt: number;
  expiresAt: number;
};

type GlobalCacheStore = {
  data: Map<string, CacheEntry<unknown>>;
  inFlight: Map<string, Promise<{ data: unknown; fetchedAt: number } | null>>;
};

function getGlobalCache(): GlobalCacheStore {
  const g = globalThis as typeof globalThis & { __emenuServerCache?: GlobalCacheStore };
  if (!g.__emenuServerCache) {
    g.__emenuServerCache = {
      data: new Map(),
      inFlight: new Map(),
    };
  }
  return g.__emenuServerCache;
}

async function fetchJsonWithTimeout<T>(url: string, revalidateSeconds: number, timeoutMs: number): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      next: { revalidate: revalidateSeconds },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function cachedServerFetch<T>(
  key: string,
  url: string,
  ttlMs: number,
  timeoutMs = 3000
): Promise<{ data: T | null; fetchedAt: number }> {
  const store = getGlobalCache();
  const now = Date.now();
  const cached = store.data.get(key) as CacheEntry<T> | undefined;

  if (cached && now < cached.expiresAt) {
    return { data: cached.data, fetchedAt: cached.fetchedAt };
  }

  const existingPromise = store.inFlight.get(key);
  if (existingPromise) {
    const result = await existingPromise;
    if (result) {
      return { data: result.data as T, fetchedAt: result.fetchedAt };
    }
    return cached ? { data: cached.data, fetchedAt: cached.fetchedAt } : { data: null, fetchedAt: 0 };
  }

  const revalidateSeconds = Math.max(1, Math.floor(ttlMs / 1000));
  const promise = (async () => {
    const data = await fetchJsonWithTimeout<T>(url, revalidateSeconds, timeoutMs);
    if (data !== null) {
      const fetchedAt = Date.now();
      store.data.set(key, {
        data,
        fetchedAt,
        expiresAt: fetchedAt + ttlMs,
      });
      return { data, fetchedAt };
    }
    return null;
  })().finally(() => {
    store.inFlight.delete(key);
  });

  store.inFlight.set(key, promise);
  const fresh = await promise;
  if (fresh) {
    return { data: fresh.data as T, fetchedAt: fresh.fetchedAt };
  }

  // Serve stale cache on transient upstream failure instead of blocking page load
  if (cached) {
    return { data: cached.data, fetchedAt: cached.fetchedAt };
  }
  return { data: null, fetchedAt: 0 };
}

export const getServerSettings = cache(async (): Promise<StoreSettings | null> => {
  const { data } = await cachedServerFetch<StoreSettings>(
    "setting",
    `${API_BASE}/setting`,
    300_000,
    2500
  );
  return data;
});

export const getServerOrderConfig = cache(async (): Promise<OrderConfig | null> => {
  const { data } = await cachedServerFetch<OrderConfig>(
    "e_orderConfig",
    `${API_BASE}/e_orderConfig`,
    300_000,
    2500
  );
  return data;
});

export const getServerMenu = cache(async (): Promise<{ data: MenuType | null; ageMs: number }> => {
  const result = await cachedServerFetch<MenuType>(
    "menu",
    `${API_BASE}/GetAllProductWithCat`,
    15_000,
    3500
  );
  if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
    return { data: null, ageMs: 0 };
  }
  return {
    data: result.data,
    ageMs: Math.max(0, Date.now() - result.fetchedAt),
  };
});

export const getServerTables = cache(async (): Promise<RawTableRecord[] | null> => {
  const { data } = await cachedServerFetch<RawTableRecord[]>(
    "tables",
    `${API_BASE}/tables`,
    10_000,
    2500
  );
  return Array.isArray(data) ? data : null;
});

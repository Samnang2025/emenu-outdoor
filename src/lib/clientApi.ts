import { MenuType, orderHistoryType } from "@/types/model";
import { API_BASE, OrderConfig, RawTableRecord, StoreSettings } from "./api";

type ClientCacheEntry<T> = {
  data: T;
  fetchedAt: number;
};

type EmenuPrefetchStore = {
  tables?: Promise<RawTableRecord[] | null>;
  menu?: Promise<MenuType | null>;
  setting?: Promise<StoreSettings | null>;
  config?: Promise<OrderConfig | null>;
  orders?: Promise<orderHistoryType | null>;
  ordersTable?: string;
};

declare global {
  interface Window {
    __emenuPrefetch?: EmenuPrefetchStore;
  }
}

const memoryCache = new Map<string, ClientCacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const STORAGE_PREFIX = "emenu_cache_v1:";

export function getCachedClientEntry<T>(key: string): ClientCacheEntry<T> | null {
  const mem = memoryCache.get(key) as ClientCacheEntry<T> | undefined;
  if (mem) return mem;

  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.localStorage.getItem(`${STORAGE_PREFIX}${key}`) ??
      window.sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClientCacheEntry<T>;
    if (parsed && parsed.data !== undefined) {
      memoryCache.set(key, parsed);
      return parsed;
    }
  } catch {
    // Ignore storage read/JSON errors
  }
  return null;
}

export function seedClientCache<T>(key: string, data: T, fetchedAt = Date.now()): void {
  if (data === null || data === undefined) return;
  const existing = memoryCache.get(key) as ClientCacheEntry<T> | undefined;
  if (existing && existing.fetchedAt >= fetchedAt) return;

  const entry: ClientCacheEntry<T> = { data, fetchedAt };
  memoryCache.set(key, entry);

  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Ignore storage quota errors
  }
}

function consumeHeadPrefetch<T>(prefetchKey: keyof Omit<EmenuPrefetchStore, "ordersTable">): Promise<T | null> | null {
  if (typeof window === "undefined") return null;
  const store = window.__emenuPrefetch;
  if (!store || !store[prefetchKey]) return null;
  const promise = store[prefetchKey] as Promise<T | null>;
  delete store[prefetchKey];
  return promise;
}

async function fetchJsonSafe<T>(url: string, init?: RequestInit): Promise<T | null> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text) as T;
}

async function fetchClientCached<T>(
  key: string,
  url: string,
  ttlMs: number,
  forceRefresh = false,
  prefetchKey?: keyof Omit<EmenuPrefetchStore, "ordersTable">
): Promise<T | null> {
  // Always consume an in-flight <head> prefetch started at HTML arrival before checking TTL
  if (prefetchKey) {
    const headPromise = consumeHeadPrefetch<T>(prefetchKey);
    if (headPromise) {
      const wrapped = headPromise
        .then((data) => {
          if (data !== null) {
            seedClientCache(key, data, Date.now());
          }
          return data;
        })
        .finally(() => {
          inFlightRequests.delete(key);
        });
      inFlightRequests.set(key, wrapped);
      return wrapped;
    }
  }

  const cached = getCachedClientEntry<T>(key);
  if (!forceRefresh && cached && Date.now() - cached.fetchedAt < ttlMs) {
    return cached.data;
  }

  const existing = inFlightRequests.get(key) as Promise<T | null> | undefined;
  if (existing) {
    return existing;
  }

  const requestPromise = (async () => {
    const data = await fetchJsonSafe<T>(url, { cache: "no-store" });
    if (data !== null) {
      seedClientCache(key, data, Date.now());
    }
    return data;
  })().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, requestPromise);
  return requestPromise;
}

export function hasPendingHeadPrefetch(prefetchKey: keyof Omit<EmenuPrefetchStore, "ordersTable">): boolean {
  return typeof window !== "undefined" && Boolean(window.__emenuPrefetch?.[prefetchKey]);
}

export function fetchClientMenu(forceRefresh = false): Promise<MenuType | null> {
  return fetchClientCached<MenuType>(
    "menu",
    `${API_BASE}/GetAllProductWithCat`,
    15_000,
    forceRefresh,
    "menu"
  );
}

export function fetchClientSettings(forceRefresh = false): Promise<StoreSettings | null> {
  return fetchClientCached<StoreSettings>(
    "setting",
    `${API_BASE}/setting`,
    300_000,
    forceRefresh,
    "setting"
  );
}

export function fetchClientOrderConfig(forceRefresh = false): Promise<OrderConfig | null> {
  return fetchClientCached<OrderConfig>(
    "e_orderConfig",
    `${API_BASE}/e_orderConfig`,
    300_000,
    forceRefresh,
    "config"
  );
}

export function fetchClientTables(forceRefresh = false): Promise<RawTableRecord[] | null> {
  return fetchClientCached<RawTableRecord[]>(
    "tables",
    `${API_BASE}/tables`,
    15_000,
    forceRefresh,
    "tables"
  );
}

export async function fetchTableHistoryOrder(tableNumber: string): Promise<orderHistoryType | null> {
  if (typeof window !== "undefined" && window.__emenuPrefetch?.orders && window.__emenuPrefetch.ordersTable === tableNumber) {
    const prefetched = window.__emenuPrefetch.orders;
    delete window.__emenuPrefetch.orders;
    delete window.__emenuPrefetch.ordersTable;
    return prefetched;
  }

  const formData = new FormData();
  formData.append("table_num", tableNumber);
  return fetchJsonSafe<orderHistoryType>(`${API_BASE}/orders`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });
}

export async function submitTableOrder(payload: unknown): Promise<unknown> {
  return fetchJsonSafe(`${API_BASE}/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

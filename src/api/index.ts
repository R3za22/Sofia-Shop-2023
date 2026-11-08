import { createLiveApi } from './live';
import { createMockApi } from './mock';
import { createStorage } from './storage';
import type { ShopApi } from './types';

/** URL flag for demos and tests: `?fail=products,checkout` makes those operations error. */
function failFromUrl(): string[] {
  try {
    return (new URLSearchParams(window.location.search).get('fail') ?? '').split(',').filter(Boolean);
  } catch {
    return [];
  }
}

const storage = createStorage();
/** True when the browser refused localStorage and data is kept in memory only. */
export const isStorageBlocked = () => storage.blocked;

export function createApi(): ShopApi {
  const mode = __DEMO__ ? 'mock' : (import.meta.env.VITE_API_MODE ?? 'mock');
  if (mode === 'live') return createLiveApi(import.meta.env.VITE_API_BASE_URL ?? '');
  const latency = Number(import.meta.env.VITE_MOCK_LATENCY ?? 250);
  return createMockApi({ storage, latency: Number.isFinite(latency) ? latency : 250, fail: failFromUrl() });
}

export const api: ShopApi = createApi();
export { ApiError } from './types';
export type { ShopApi } from './types';

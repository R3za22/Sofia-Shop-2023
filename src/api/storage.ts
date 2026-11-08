export interface Backend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface Storage {
  get<T>(key: string, fallback: T): T;
  set(key: string, value: unknown): void;
  remove(key: string): void;
  /** True once the browser refused access; data then lives in memory for the session. */
  readonly blocked: boolean;
}

/** localStorage with an in-memory fallback so the shop still works when storage is blocked. */
export function createStorage(backend?: Backend): Storage {
  const memory = new Map<string, string>();
  let blocked = false;
  let b: Backend | undefined = backend;
  if (!b) {
    try {
      b = globalThis.localStorage;
    } catch {
      b = undefined;
    }
  }
  if (!b) blocked = true;

  const read = (key: string): string | null => {
    if (b && !blocked) {
      try {
        return b.getItem(key);
      } catch {
        blocked = true;
      }
    }
    return memory.get(key) ?? null;
  };

  return {
    get<T>(key: string, fallback: T): T {
      const raw = read(key);
      if (raw === null) return fallback;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      const raw = JSON.stringify(value);
      memory.set(key, raw);
      if (b && !blocked) {
        try {
          b.setItem(key, raw);
        } catch {
          blocked = true;
        }
      }
    },
    remove(key) {
      memory.delete(key);
      if (b && !blocked) {
        try {
          b.removeItem(key);
        } catch {
          blocked = true;
        }
      }
    },
    get blocked() {
      return blocked;
    },
  };
}

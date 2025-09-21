// Safe wrappers around Web Storage APIs

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'>;

function isStorageAvailable(storage: StorageLike | undefined): storage is StorageLike {
  try {
    if (!storage) return false;
    const testKey = '__storage_test__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const local: StorageLike | undefined = typeof window !== 'undefined' ? window.localStorage : undefined;
const session: StorageLike | undefined = typeof window !== 'undefined' ? window.sessionStorage : undefined;

const hasLocal = isStorageAvailable(local);
const hasSession = isStorageAvailable(session);

export const safeLocalStorage = {
  getItem(key: string): string | null {
    if (!hasLocal) return null;
    try {
      return local!.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    if (!hasLocal) return;
    try {
      local!.setItem(key, value);
    } catch {
      /* noop */
    }
  },
  removeItem(key: string): void {
    if (!hasLocal) return;
    try {
      local!.removeItem(key);
    } catch {
      /* noop */
    }
  },
  clear(): void {
    if (!hasLocal) return;
    try {
      local!.clear();
    } catch {
      /* noop */
    }
  },
} satisfies StorageLike;

export const safeSessionStorage = {
  getItem(key: string): string | null {
    if (!hasSession) return null;
    try {
      return session!.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    if (!hasSession) return;
    try {
      session!.setItem(key, value);
    } catch {
      /* noop */
    }
  },
  removeItem(key: string): void {
    if (!hasSession) return;
    try {
      session!.removeItem(key);
    } catch {
      /* noop */
    }
  },
  clear(): void {
    if (!hasSession) return;
    try {
      session!.clear();
    } catch {
      /* noop */
    }
  },
} satisfies StorageLike;



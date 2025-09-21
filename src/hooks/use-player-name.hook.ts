import { useCallback, useEffect, useMemo, useState } from 'react';

const KEY = 'playerName';
const COMPAT_KEYS = ['playerName', 'username', 'userName'] as const;

function safeGet(key: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, val: string) {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, val);
  } catch {}
}
function safeRemove(key: string) {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  } catch {}
}

/** Legge sincrono all'init, cercando chiavi compat; normalizza su KEY. */
function readInitial(): string | null {
  for (const k of COMPAT_KEYS) {
    const v = safeGet(k);
    if (v && v.trim()) {
      // normalizza su KEY per coerenza futura
      if (k !== KEY) safeSet(KEY, v);
      return v;
    }
  }
  return null;
}

export function usePlayerName() {
  // lettura SINCRONA per evitare il frame "null"
  const [name, setName] = useState<string | null>(readInitial);

  // opzionale: sync se cambiato in un altro tab/finestra
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (!COMPAT_KEYS.includes(e.key as any)) return;
      const v = e.newValue && e.newValue.trim() ? e.newValue : null;
      // normalizza su KEY
      if (v && e.key !== KEY) safeSet(KEY, v);
      setName(v);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const set = useCallback((v: string) => {
    const val = v.trim();
    safeSet(KEY, val);
    // scrivo anche sotto 'username' per compat eventuale
    safeSet('username', val);
    setName(val || null);
  }, []);

  const clear = useCallback(() => {
    safeRemove(KEY);
    safeRemove('username');
    safeRemove('userName');
    setName(null);
  }, []);

  // ready sempre true perché abbiamo già letto sincrono
  const ready = true;

  return useMemo(() => ({ name, set, clear, ready }), [name, set, clear]);
}

// per uso esterno eventuale
export function readPlayerName(): string | null {
  return readInitial();
}
export function writePlayerName(name: string) {
  safeSet(KEY, name);
  safeSet('username', name);
}
export function clearPlayerName() {
  safeRemove(KEY);
  safeRemove('username');
  safeRemove('userName');
}

export const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

export function getDocument(): Document | null {
  return isBrowser ? document : null;
}

export function getWindow(): Window | null {
  return isBrowser ? window : null;
}

export function generateId(prefix: string): string {
  if (isBrowser && typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

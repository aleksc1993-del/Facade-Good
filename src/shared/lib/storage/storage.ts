export interface StorageAdapter { get<T>(key: string, fallback: T): T; set<T>(key: string, value: T): void }
export const storage: StorageAdapter = {
  get: <T>(key: string, fallback: T) => { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; },
  set: <T>(key: string, value: T) => localStorage.setItem(key, JSON.stringify(value)),
};

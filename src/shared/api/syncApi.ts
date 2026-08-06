export interface SyncDevice { id: string; name: string; lastSeenAt: string; current: boolean }
export interface ChangeRecord { id: string; entity: string; entityId: string; operation: 'create' | 'update' | 'delete'; changedAt: string; deviceName: string; summary: string }
export interface SyncConflict { id: string; entity: string; entityId: string; localVersion: string; remoteVersion: string; detectedAt: string }
export interface SyncSnapshot { lastSyncedAt: string | null; devices: SyncDevice[]; changes: ChangeRecord[]; conflicts: SyncConflict[] }
const baseUrl = 'http://localhost:3000/api';
const request = async <T>(path: string, options?: RequestInit): Promise<T> => { const response = await fetch(`${baseUrl}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options }); if (!response.ok) throw new Error(`Cloud request failed: ${response.status}`); return response.json() as Promise<T>; };
export const syncApi = { getSnapshot: () => request<SyncSnapshot>('/sync/snapshot'), sync: () => request<SyncSnapshot>('/sync/run', { method: 'POST' }), resolveConflict: (id: string, resolution: 'local' | 'remote') => request<SyncConflict>(`/sync/conflicts/${id}`, { method: 'POST', body: JSON.stringify({ resolution }) }) };

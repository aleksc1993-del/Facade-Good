import { create } from 'zustand';
import { storage } from '../../../shared/lib/storage/storage';
export interface BackupSettings { folderPath: string; automaticDaily: boolean; lastBackupAt?: string }
interface BackupState extends BackupSettings { setFolderPath: (value: string) => void; setAutomaticDaily: (value: boolean) => void; markBackupCreated: () => void }
const defaults: BackupSettings = { folderPath: '', automaticDaily: false };
export const useBackupStore = create<BackupState>((set) => ({ ...storage.load<BackupSettings>('backup-settings', defaults), setFolderPath: (folderPath) => set({ folderPath }), setAutomaticDaily: (automaticDaily) => set({ automaticDaily }), markBackupCreated: () => set({ lastBackupAt: new Date().toISOString() }) }));
useBackupStore.subscribe(({ folderPath, automaticDaily, lastBackupAt }) => storage.save('backup-settings', { folderPath, automaticDaily, lastBackupAt }));

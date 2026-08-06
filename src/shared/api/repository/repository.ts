import type { StorageRepository } from './types';
import { SQLiteRepository } from './sqliteRepository';
import { LocalStorageRepository } from './localStorageRepository';

// Для переключения источника данных достаточно заменить одну строку.
const canUseSQLite = typeof window !== 'undefined' && 'facadeGood' in window;
export const repository: StorageRepository = canUseSQLite
  ? new SQLiteRepository()
  : new LocalStorageRepository();
// Для API: import { ApiRepository } from './apiRepository' и замените SQLiteRepository на ApiRepository.

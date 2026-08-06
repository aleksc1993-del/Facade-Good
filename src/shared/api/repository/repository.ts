import type { StorageRepository } from './types';
import { SQLiteRepository } from './sqliteRepository';

// Для переключения источника данных достаточно заменить одну строку.
export const repository: StorageRepository = new SQLiteRepository();
// Для API: import { ApiRepository } from './apiRepository' и замените SQLiteRepository на ApiRepository.

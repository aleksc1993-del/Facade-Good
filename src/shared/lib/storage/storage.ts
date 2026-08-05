type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type StorageData = Record<string, JsonValue>;

export interface StorageMigration {
  version: number;
  migrate: (data: StorageData) => StorageData;
}

export interface StorageAdapter {
  load<T>(key: string, fallback: T): T;
  save<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

interface StoredValue {
  [key: string]: JsonValue;
  version: number;
  value: JsonValue;
}

const databaseVersionKey = 'facade-good-database-version';
const databasePrefix = 'facade-good-';
const currentDatabaseVersion = 1;

const isJsonValue = (value: JsonValue | undefined): value is JsonValue => value !== undefined;

const isStoredValue = (value: JsonValue): value is StoredValue => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
  && typeof value.version === 'number' && 'value' in value
);

const migrations: StorageMigration[] = [
  {
    version: 1,
    migrate: (data) => data,
  },
];

const parseJsonValue = (value: string): JsonValue | undefined => {
  try {
    const parsed: JsonValue = JSON.parse(value) as JsonValue;
    return isJsonValue(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const migrateDatabase = (): void => {
  const savedVersion = Number(localStorage.getItem(databaseVersionKey) ?? 0);
  if (savedVersion >= currentDatabaseVersion) return;

  let data: StorageData = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(databasePrefix) || key === databaseVersionKey) continue;
    const value = localStorage.getItem(key);
    const parsed = value === null ? undefined : parseJsonValue(value);
    if (parsed !== undefined) data[key] = parsed;
  }

  for (const migration of migrations) {
    if (migration.version > savedVersion) data = migration.migrate(data);
  }

  localStorage.setItem(databaseVersionKey, String(currentDatabaseVersion));
};

export const storage: StorageAdapter = {
  load: <T>(key: string, fallback: T): T => {
    migrateDatabase();
    const rawValue = localStorage.getItem(`${databasePrefix}${key}`);
    if (rawValue === null) return fallback;

    const parsed = parseJsonValue(rawValue);
    if (parsed === undefined) return fallback;

    if (isStoredValue(parsed)) {
      return parsed.value as T;
    }
    return parsed as T;
  },
  save: <T>(key: string, value: T): void => {
    migrateDatabase();
    const storedValue: StoredValue = { version: currentDatabaseVersion, value: value as JsonValue };
    localStorage.setItem(`${databasePrefix}${key}`, JSON.stringify(storedValue));
  },
  remove: (key: string): void => localStorage.removeItem(`${databasePrefix}${key}`),
  clear: (): void => {
    const keysToRemove: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(databasePrefix)) keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },
};

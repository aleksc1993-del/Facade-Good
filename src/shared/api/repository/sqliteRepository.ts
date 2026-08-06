import type { Client, Order, Payment } from '@shared/types/models';
import type { StorageRepository } from './types';

const api = window.facadeGood;
export class SQLiteRepository implements StorageRepository {
  getClients = () => api.databaseGet<Client[]>('clients', []);
  saveClient = (client: Client) => api.databaseSave('clients', client);
  deleteClient = (id: string) => api.databaseDelete('clients', id);
  getOrders = () => api.databaseGet<Order[]>('orders', []);
  saveOrder = (order: Order) => api.databaseSave('orders', order);
  getPayments = () => api.databaseGet<Payment[]>('payments', []);
  savePayment = (payment: Payment) => api.databaseSave('payments', payment);
  deletePayment = (id: string) => api.databaseDelete('payments', id);
  loadValue = <T>(key: string, fallback: T) => api.databaseGet<T>(key, fallback);
  saveValue = <T>(key: string, value: T) => api.databaseSet(key, value);
  removeValue = (key: string) => api.databaseRemove(key);
  clear = () => api.databaseClear();
  exportDatabase = () => api.databaseExport();
  importDatabase = (serialized: string) => api.databaseImport(serialized);
}

export const repository: StorageRepository = new SQLiteRepository();

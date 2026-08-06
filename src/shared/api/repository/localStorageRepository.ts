import type { Client, Order, Payment } from '@shared/types/models';
import type { StorageRepository } from './types';

const key = (name: string) => `facade-good-${name}`;
const read = <T>(name: string, fallback: T): T => {
  const value = window.localStorage.getItem(key(name));
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
};

export class LocalStorageRepository implements StorageRepository {
  getClients = async () => read<Client[]>('clients', []);
  saveClient = async (client: Client) => this.saveValue('clients', [...read<Client[]>('clients', []).filter((item) => item.id !== client.id), client]);
  deleteClient = async (id: string) => this.saveValue('clients', read<Client[]>('clients', []).filter((item) => item.id !== id));
  getOrders = async () => read<Order[]>('orders', []);
  saveOrder = async (order: Order) => this.saveValue('orders', [...read<Order[]>('orders', []).filter((item) => item.id !== order.id), order]);
  getPayments = async () => read<Payment[]>('payments', []);
  savePayment = async (payment: Payment) => this.saveValue('payments', [...read<Payment[]>('payments', []).filter((item) => item.id !== payment.id), payment]);
  deletePayment = async (id: string) => this.saveValue('payments', read<Payment[]>('payments', []).filter((item) => item.id !== id));
  loadValue = async <T>(name: string, fallback: T) => read(name, fallback);
  saveValue = async <T>(name: string, value: T) => window.localStorage.setItem(key(name), JSON.stringify(value));
  removeValue = async (name: string) => window.localStorage.removeItem(key(name));
  clear = async () => Object.keys(window.localStorage).filter((name) => name.startsWith('facade-good-')).forEach((name) => window.localStorage.removeItem(name));
  exportDatabase = async () => JSON.stringify({ format: 'facade-good-backup', data: Object.fromEntries(Object.keys(window.localStorage).filter((name) => name.startsWith('facade-good-')).map((name) => [name, window.localStorage.getItem(name)])) });
  importDatabase = async (serialized: string) => { try { const backup = JSON.parse(serialized) as { format?: string; data?: Record<string, string> }; if (backup.format !== 'facade-good-backup' || !backup.data) return false; await this.clear(); Object.entries(backup.data).forEach(([name, value]) => { if (typeof value === 'string') window.localStorage.setItem(name, value); }); return true; } catch { return false; } };
}

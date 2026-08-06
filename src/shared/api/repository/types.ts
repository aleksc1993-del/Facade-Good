import type { Client, Order, Payment } from '@shared/types/models';

export interface StorageRepository {
  getClients(): Promise<Client[]>;
  saveClient(client: Client): Promise<void>;
  deleteClient(id: string): Promise<void>;
  getOrders(): Promise<Order[]>;
  saveOrder(order: Order): Promise<void>;
  getPayments(): Promise<Payment[]>;
  savePayment(payment: Payment): Promise<void>;
  deletePayment(id: string): Promise<void>;
  loadValue<T>(key: string, fallback: T): Promise<T>;
  saveValue<T>(key: string, value: T): Promise<void>;
  removeValue(key: string): Promise<void>;
  clear(): Promise<void>;
  exportDatabase(): Promise<string>;
  importDatabase(serialized: string): Promise<boolean>;
}

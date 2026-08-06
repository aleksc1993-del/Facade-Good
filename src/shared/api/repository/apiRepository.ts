import type { Client, Order, Payment } from '@shared/types/models';
import type { StorageRepository } from './types';

export class ApiRepository implements StorageRepository {
  public constructor(private readonly baseUrl = '/api') {}

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    return response.json() as Promise<T>;
  }

  getClients = () => this.request<Client[]>('/clients');
  saveClient = (client: Client) => this.request<void>(`/clients/${client.id}`, { method: 'PUT', body: JSON.stringify(client) });
  deleteClient = (id: string) => this.request<void>(`/clients/${id}`, { method: 'DELETE' });
  getOrders = () => this.request<Order[]>('/orders');
  saveOrder = (order: Order) => this.request<void>(`/orders/${order.id}`, { method: 'PUT', body: JSON.stringify(order) });
  deleteOrder = (id: string) => this.request<void>(`/orders/${id}`, { method: 'DELETE' });
  getPayments = () => this.request<Payment[]>('/payments');
  savePayment = (payment: Payment) => this.request<void>(`/payments/${payment.id}`, { method: 'PUT', body: JSON.stringify(payment) });
  deletePayment = (id: string) => this.request<void>(`/payments/${id}`, { method: 'DELETE' });
  loadValue = <T>(key: string, fallback: T) => this.request<T>(`/values/${encodeURIComponent(key)}`).catch(() => fallback);
  saveValue = <T>(key: string, value: T) => this.request<void>(`/values/${encodeURIComponent(key)}`, { method: 'PUT', body: JSON.stringify(value) });
  removeValue = (key: string) => this.request<void>(`/values/${encodeURIComponent(key)}`, { method: 'DELETE' });
  clear = () => this.request<void>('/database', { method: 'DELETE' });
  exportDatabase = () => this.request<string>('/database/export');
  importDatabase = (serialized: string) => this.request<boolean>('/database/import', { method: 'POST', body: JSON.stringify({ serialized }) });
}

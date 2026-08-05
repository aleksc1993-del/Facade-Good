import type { Client, Order } from '@shared/types/models';

export type SearchResultKind = 'client' | 'order';
export interface GlobalSearchResult { id: string; kind: SearchResultKind; title: string; description: string; path: string }
const normalize = (value: string): string => value.trim().toLocaleLowerCase('ru-RU');
const compact = (value: string): string => normalize(value).replace(/[\s()+-]/g, '');
const matches = (query: string, values: string[]): boolean => { const normalizedQuery = normalize(query); if (!normalizedQuery) return false; const compactQuery = compact(query); return values.some((value) => normalize(value).includes(normalizedQuery) || compact(value).includes(compactQuery)); };
export const globalSearch = (clients: Client[], orders: Order[], query: string): GlobalSearchResult[] => [
  ...clients.filter((client) => matches(query, [client.name, client.phone, client.comment, client.city])).map((client) => ({ id: client.id, kind: 'client' as const, title: client.name, description: client.phone, path: '/clients' })),
  ...orders.filter((order) => { const client = clients.find((item) => item.id === order.clientId); return matches(query, [order.number, order.comment, order.contractNumber ?? '', order.invoiceNumber ?? '', client?.name ?? '', client?.phone ?? '', ...(order.items ?? []).map((item) => item.name)]); }).map((order) => { const client = clients.find((item) => item.id === order.clientId); return { id: order.id, kind: 'order' as const, title: `Заказ №${order.number}`, description: [client?.name, order.contractNumber ? `Договор ${order.contractNumber}` : '', order.invoiceNumber ? `Счёт ${order.invoiceNumber}` : ''].filter(Boolean).join(' · '), path: '/orders' }; }),
];

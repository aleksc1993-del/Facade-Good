export interface Client { id: string; name: string; phone: string; city: string; comment: string; createdAt: string; archivedAt?: string }
export const orderStatuses = ['Новый', 'Замер', 'В работе', 'Фрезеровка', 'Покраска', 'Сушка', 'Упаковка', 'Готов', 'Выдан'] as const;
export type OrderStatus = typeof orderStatuses[number];
export interface OrderItem { id: string; name: string; height: number; width: number; quantity: number; price: number }
export interface Order { id: string; clientId: string; number: string; contractNumber?: string; invoiceNumber?: string; status: OrderStatus; createdAt: string; deadline: string; comment: string; items: OrderItem[]; archivedAt?: string }
export const paymentTypes = ['Предоплата', 'Оплата', 'Возврат'] as const;
export type PaymentType = typeof paymentTypes[number];
export interface Payment { id: string; orderId: string; date: string; amount: number; type: PaymentType }
export interface OrganizationSettings { name: string; phone: string; email: string; address: string; logo: string }
export type ThemeMode = 'light' | 'dark';
export interface Currency { code: string; name: string; symbol: string; rate: number; isBase: boolean }
export interface Organization { id: string; name: string; taxNumber?: string; isActive: boolean; createdAt: string }
export interface Warehouse { id: string; organizationId: string; name: string; address: string; isActive: boolean }
export interface AuditEntry { id: string; userId: string; action: string; entity: string; entityId?: string; details?: string; createdAt: string }
export interface DocumentTemplate { id: string; name: string; type: 'invoice' | 'contract' | 'receipt'; content: string; updatedAt: string }

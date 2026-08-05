export interface Client { id: string; name: string; phone: string; city: string; comment: string; createdAt: string }
export const orderStatuses = ['Новый', 'В работе', 'Готов', 'Выдан'] as const;
export type OrderStatus = typeof orderStatuses[number];
export interface OrderItem { id: string; name: string; height: number; width: number; quantity: number; price: number }
export interface Order { id: string; clientId: string; number: string; status: OrderStatus; createdAt: string; deadline: string; comment: string; items: OrderItem[] }
export const paymentTypes = ['Предоплата', 'Оплата', 'Возврат'] as const;
export type PaymentType = typeof paymentTypes[number];
export interface Payment { id: string; orderId: string; date: string; amount: number; type: PaymentType }

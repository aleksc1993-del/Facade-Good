import type { Order, OrderItem, Payment } from '../../types/models';

export type PaymentStatus = 'Оплачено' | 'Частично оплачено' | 'Не оплачено';

export const getOrderTotal = (order: Pick<Order, 'items'>): number => order.items.reduce((total, item) => total + item.quantity * item.price, 0);
export const getPaymentValue = (payment: Payment): number => payment.type === 'Возврат' ? -payment.amount : payment.amount;
export const getOrderPaid = (orderId: string, payments: Payment[]): number => Math.max(0, payments.filter((payment) => payment.orderId === orderId).reduce((total, payment) => total + getPaymentValue(payment), 0));
export const getOrderBalance = (order: Pick<Order, 'id' | 'items'>, payments: Payment[]): number => Math.max(0, getOrderTotal(order) - getOrderPaid(order.id, payments));
export const getPaymentStatus = (order: Pick<Order, 'id' | 'items'>, payments: Payment[]): PaymentStatus => {
  const total = getOrderTotal(order);
  const balance = getOrderBalance(order, payments);
  if (total > 0 && balance === 0) return 'Оплачено';
  if (balance < total) return 'Частично оплачено';
  return 'Не оплачено';
};
export const getItemTotal = (item?: Partial<OrderItem>): number => (item?.quantity ?? 0) * (item?.price ?? 0);

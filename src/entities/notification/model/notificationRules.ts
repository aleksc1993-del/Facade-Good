import type { Client, Order } from '../../../shared/types/models';
import { getOrderBalance, getOrderTotal } from '../../../shared/lib/order-financials';
import type { Payment } from '../../../shared/types/models';

export type NotificationKind = 'soon' | 'unpaid' | 'overdue' | 'pickup' | 'call';
export interface SystemNotification { id: string; kind: Exclude<NotificationKind, 'call'>; title: string; description: string; orderId: string; date: string }

const startOfDay = (date: Date): number => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
const daysUntil = (date: string, today: Date): number => Math.round((startOfDay(new Date(date)) - startOfDay(today)) / 86400000);

export const buildNotifications = (orders: Order[], payments: Payment[], clients: Client[], today = new Date()): SystemNotification[] => orders.flatMap((order) => {
  const clientName = clients.find((client) => client.id === order.clientId)?.name ?? 'Клиент';
  const balance = getOrderBalance(order, payments);
  const total = getOrderTotal(order);
  const result: SystemNotification[] = [];
  const remainingDays = order.deadline ? daysUntil(order.deadline, today) : null;
  if (remainingDays !== null && remainingDays >= 0 && remainingDays <= 3 && order.status !== 'Выдан') result.push({ id: `${order.id}-soon`, kind: 'soon', title: 'Скоро срок изготовления', description: `Заказ №${order.number} для ${clientName}: срок через ${remainingDays} дн.`, orderId: order.id, date: order.deadline });
  if (balance > 0 && total > 0) result.push({ id: `${order.id}-unpaid`, kind: 'unpaid', title: 'Клиент не оплатил', description: `По заказу №${order.number} задолженность ${balance.toLocaleString('ru-RU')} ₽`, orderId: order.id, date: order.createdAt });
  if (remainingDays !== null && remainingDays < 0 && order.status !== 'Выдан') result.push({ id: `${order.id}-overdue`, kind: 'overdue', title: 'Заказ просрочен', description: `Заказ №${order.number} просрочен на ${Math.abs(remainingDays)} дн.`, orderId: order.id, date: order.deadline });
  if (order.status === 'Готов' && remainingDays === 0) result.push({ id: `${order.id}-pickup`, kind: 'pickup', title: 'Сегодня выдача заказа', description: `Заказ №${order.number} готов к выдаче для ${clientName}`, orderId: order.id, date: order.deadline });
  return result;
});

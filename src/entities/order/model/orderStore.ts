import { create } from 'zustand';
import { repository } from '@shared/api/repository/sqliteRepository';
import type { Order } from '../../../shared/types/models';
interface OrderState { orders: Order[]; addOrder: (order: Order) => void; replaceOrders: (orders: Order[]) => void; updateOrder: (order: Order) => void; archiveOrder: (id: string) => void; restoreOrder: (id: string) => void; deleteOrder: (id: string) => void }
export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  addOrder: (order) => { set((state) => ({ orders: [...state.orders, order] })); void repository.saveOrder(order); },
  replaceOrders: (orders) => set({ orders }),
  updateOrder: (order) => { set((state) => ({ orders: state.orders.map((item) => item.id === order.id ? order : item) })); void repository.saveOrder(order); },
  archiveOrder: (id) => set((state) => ({ orders: state.orders.map((order) => order.id === id ? { ...order, archivedAt: new Date().toISOString() } : order) })),
  restoreOrder: (id) => set((state) => ({ orders: state.orders.map((order) => order.id === id ? { ...order, archivedAt: undefined } : order) })),
  deleteOrder: (id) => set((state) => ({ orders: state.orders.filter((order) => order.id !== id) })),
}));
void repository.getOrders().then((orders) => useOrderStore.getState().replaceOrders(orders));

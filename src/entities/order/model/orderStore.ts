import { create } from 'zustand';
import { repository } from '@shared/api/repository/repository';
import type { Order } from '../../../shared/types/models';
interface OrderState { orders: Order[]; addOrder: (order: Order) => void; replaceOrders: (orders: Order[]) => void; updateOrder: (order: Order) => void; archiveOrder: (id: string) => void; restoreOrder: (id: string) => void; deleteOrder: (id: string) => void }
export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  addOrder: (order) => { set((state) => ({ orders: [...state.orders, order] })); void repository.saveOrder(order); },
  replaceOrders: (orders) => set({ orders }),
  updateOrder: (order) => { set((state) => ({ orders: state.orders.map((item) => item.id === order.id ? order : item) })); void repository.saveOrder(order); },
  archiveOrder: (id) => { const order = useOrderStore.getState().orders.find((item) => item.id === id); if (order) { const updated = { ...order, archivedAt: new Date().toISOString() }; set((state) => ({ orders: state.orders.map((item) => item.id === id ? updated : item) })); void repository.saveOrder(updated); } },
  restoreOrder: (id) => { const order = useOrderStore.getState().orders.find((item) => item.id === id); if (order) { const updated = { ...order, archivedAt: undefined }; set((state) => ({ orders: state.orders.map((item) => item.id === id ? updated : item) })); void repository.saveOrder(updated); } },
  deleteOrder: (id) => { set((state) => ({ orders: state.orders.filter((order) => order.id !== id) })); void repository.deleteOrder(id); },
}));
void repository.getOrders().then((orders) => useOrderStore.getState().replaceOrders(orders));

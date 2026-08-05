import { create } from 'zustand';
import { storage } from '../../../shared/lib/storage/storage';
import type { Order } from '../../../shared/types/models';
interface OrderState { orders: Order[]; addOrder: (order: Order) => void; updateOrder: (order: Order) => void; deleteOrder: (id: string) => void }
export const useOrderStore = create<OrderState>((set) => ({
  orders: storage.load<Order[]>('orders', []),
  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
  updateOrder: (order) => set((state) => ({ orders: state.orders.map((item) => item.id === order.id ? order : item) })),
  deleteOrder: (id) => set((state) => ({ orders: state.orders.filter((order) => order.id !== id) })),
}));
useOrderStore.subscribe((state) => storage.save('orders', state.orders));

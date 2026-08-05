import { create } from 'zustand';
import { storage } from '../../../shared/lib/storage/storage';
import type { Order } from '../../../shared/types/models';
interface OrderState { orders: Order[]; addOrder: (order: Order) => void }
export const useOrderStore = create<OrderState>((set) => ({ orders: storage.load<Order[]>('orders', []), addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })) }));
useOrderStore.subscribe((state) => storage.save('orders', state.orders));

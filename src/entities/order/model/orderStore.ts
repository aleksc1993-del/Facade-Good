import { create } from 'zustand';
import { storage } from '../../../shared/lib/storage/storage';
import type { Order } from '../../../shared/types/models';
interface OrderState { orders: Order[]; addOrder: (order: Order) => void }
export const useOrderStore = create<OrderState>((set) => ({ orders: storage.get<Order[]>('facade-good-orders', []), addOrder: (order) => set((state) => { const orders = [...state.orders, order]; storage.set('facade-good-orders', orders); return { orders }; }) }));

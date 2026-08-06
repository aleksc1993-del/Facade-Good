import { create } from 'zustand';
import { storage } from '../../../shared/lib/storage/storage';
import type { Payment } from '../../../shared/types/models';
interface PaymentState { payments: Payment[]; addPayment: (payment: Payment) => void; replacePayments: (payments: Payment[]) => void; deletePayment: (id: string) => void }
export const usePaymentStore = create<PaymentState>((set) => ({
  payments: storage.load<Payment[]>('payments', []),
  addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),
  replacePayments: (payments) => set({ payments }),
  deletePayment: (id) => set((state) => ({ payments: state.payments.filter((payment) => payment.id !== id) })),
}));
usePaymentStore.subscribe((state) => storage.save('payments', state.payments));

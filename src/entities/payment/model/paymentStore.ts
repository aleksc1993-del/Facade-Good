import { create } from 'zustand';
import { repository } from '@shared/api/repository/repository';
import type { Payment } from '../../../shared/types/models';
interface PaymentState { payments: Payment[]; addPayment: (payment: Payment) => void; replacePayments: (payments: Payment[]) => void; deletePayment: (id: string) => void }
export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  addPayment: (payment) => { set((state) => ({ payments: [...state.payments, payment] })); void repository.savePayment(payment); },
  replacePayments: (payments) => set({ payments }),
  deletePayment: (id) => { set((state) => ({ payments: state.payments.filter((payment) => payment.id !== id) })); void repository.deletePayment(id); },
}));
void repository.getPayments().then((payments) => usePaymentStore.getState().replacePayments(payments));

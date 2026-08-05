import { create } from 'zustand';
import { storage } from '../../../shared/lib/storage/storage';
import type { Payment } from '../../../shared/types/models';
interface PaymentState { payments: Payment[]; addPayment: (payment: Payment) => void }
export const usePaymentStore = create<PaymentState>((set) => ({ payments: storage.load<Payment[]>('payments', []), addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })) }));
usePaymentStore.subscribe((state) => storage.save('payments', state.payments));

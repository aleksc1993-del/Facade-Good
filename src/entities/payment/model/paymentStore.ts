import { create } from 'zustand';
import { storage } from '../../../shared/lib/storage/storage';
import type { Payment } from '../../../shared/types/models';
interface PaymentState { payments: Payment[]; addPayment: (payment: Payment) => void }
export const usePaymentStore = create<PaymentState>((set) => ({ payments: storage.get<Payment[]>('facade-good-payments', []), addPayment: (payment) => set((state) => { const payments = [...state.payments, payment]; storage.set('facade-good-payments', payments); return { payments }; }) }));

import { create } from 'zustand';
import { storage } from '../../../shared/lib/storage/storage';

interface DocumentState { nextNumber: number; issueNumber: () => string }
export const useDocumentStore = create<DocumentState>((set, get) => ({
  nextNumber: storage.load<number>('documents-next-number', 1),
  issueNumber: () => { const number = get().nextNumber; set({ nextNumber: number + 1 }); return `ДОК-${String(number).padStart(6, '0')}`; },
}));
useDocumentStore.subscribe((state) => storage.save('documents-next-number', state.nextNumber));

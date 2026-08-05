import { create } from 'zustand';
import { storage } from '../../../shared/lib/storage/storage';

export interface CallReminder {
  id: string;
  clientId: string;
  date: string;
  note: string;
  completed: boolean;
}

interface NotificationState {
  reminders: CallReminder[];
  addReminder: (reminder: CallReminder) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  reminders: storage.load<CallReminder[]>('call-reminders', []),
  addReminder: (reminder) => set((state) => ({ reminders: [...state.reminders, reminder] })),
  deleteReminder: (id) => set((state) => ({ reminders: state.reminders.filter((reminder) => reminder.id !== id) })),
  toggleReminder: (id) => set((state) => ({ reminders: state.reminders.map((reminder) => reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder) })),
}));

useNotificationStore.subscribe((state) => storage.save('call-reminders', state.reminders));

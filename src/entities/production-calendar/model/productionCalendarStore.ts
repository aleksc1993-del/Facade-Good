import { create } from 'zustand';
import { storage } from '@shared/lib/storage/storage';
import { createDefaultCalendar, type CalendarException, type ProductionCalendar } from './productionCalendar';

interface ProductionCalendarState {
  calendars: ProductionCalendar[];
  saveCalendar: (calendar: ProductionCalendar) => void;
  addException: (year: number, exception: CalendarException) => void;
  removeException: (year: number, date: string) => void;
}

const currentYear = new Date().getFullYear();
const initialCalendars = storage.load<ProductionCalendar[]>('production-calendars', [createDefaultCalendar(currentYear)]);

export const useProductionCalendarStore = create<ProductionCalendarState>((set) => ({
  calendars: initialCalendars,
  saveCalendar: (calendar) => set((state) => ({ calendars: state.calendars.some((item) => item.year === calendar.year) ? state.calendars.map((item) => item.year === calendar.year ? calendar : item) : [...state.calendars, calendar] })),
  addException: (year, exception) => set((state) => ({ calendars: state.calendars.map((calendar) => calendar.year !== year ? calendar : { ...calendar, exceptions: [...calendar.exceptions.filter((item) => item.date !== exception.date), exception] }) })),
  removeException: (year, date) => set((state) => ({ calendars: state.calendars.map((calendar) => calendar.year !== year ? calendar : { ...calendar, exceptions: calendar.exceptions.filter((item) => item.date !== date) }) })),
}));

useProductionCalendarStore.subscribe((state) => storage.save('production-calendars', state.calendars));

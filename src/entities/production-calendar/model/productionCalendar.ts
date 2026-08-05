export type CalendarDayType = 'workday' | 'weekend' | 'holiday';

export interface CalendarException {
  date: string;
  type: CalendarDayType;
  comment: string;
}

export interface ProductionCalendar {
  year: number;
  exceptions: CalendarException[];
}

export const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const russianHolidays = (year: number): CalendarException[] => [
  ...Array.from({ length: 8 }, (_, index) => ({ date: `${year}-01-${String(index + 1).padStart(2, '0')}`, type: 'holiday' as const, comment: 'Новогодние каникулы' })),
  { date: `${year}-02-23`, type: 'holiday', comment: 'День защитника Отечества' },
  { date: `${year}-03-08`, type: 'holiday', comment: 'Международный женский день' },
  { date: `${year}-05-01`, type: 'holiday', comment: 'Праздник Весны и Труда' },
  { date: `${year}-05-09`, type: 'holiday', comment: 'День Победы' },
  { date: `${year}-06-12`, type: 'holiday', comment: 'День России' },
  { date: `${year}-11-04`, type: 'holiday', comment: 'День народного единства' },
];

export const createDefaultCalendar = (year: number): ProductionCalendar => ({ year, exceptions: russianHolidays(year) });

export const getCalendarDayType = (date: Date, calendar: ProductionCalendar): CalendarDayType => {
  const exception = calendar.exceptions.find((item) => item.date === getDateKey(date));
  if (exception) return exception.type;
  const day = date.getDay();
  return day === 0 || day === 6 ? 'weekend' : 'workday';
};

export const isWorkday = (date: Date, calendar: ProductionCalendar): boolean => getCalendarDayType(date, calendar) === 'workday';

export const addWorkdays = (start: Date, amount: number, calendar: ProductionCalendar): Date => {
  const result = new Date(start);
  let remaining = Math.max(0, amount);
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (isWorkday(result, calendar)) remaining -= 1;
  }
  return result;
};

export const isOverdue = (deadline: string, status: string, calendar: ProductionCalendar, now = new Date()): boolean => {
  if (!deadline || status === 'Готов' || status === 'Выдан') return false;
  const deadlineDate = new Date(deadline);
  return deadlineDate.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

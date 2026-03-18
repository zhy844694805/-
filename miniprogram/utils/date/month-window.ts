import { LocalDate } from '@/utils/date/local-date';

function createNativeDate(date: LocalDate): Date {
  return new Date(date.year, date.month - 1, date.day);
}

function fromNativeDate(date: Date): LocalDate {
  return new LocalDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function isSameLocalDate(a: LocalDate, b: LocalDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function shiftMonth(date: LocalDate, delta: number): LocalDate {
  const totalMonths = date.year * 12 + (date.month - 1) + delta;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = (totalMonths % 12) + 1;
  const targetDay = Math.min(date.day, daysInMonth(targetYear, targetMonth));

  return new LocalDate(targetYear, targetMonth, targetDay);
}

export function buildMonthWindow(date: LocalDate): LocalDate[] {
  const firstOfMonth = new LocalDate(date.year, date.month, 1);
  const firstNativeDate = createNativeDate(firstOfMonth);
  const mondayFirstIndex = (firstNativeDate.getDay() + 6) % 7;
  const startDate = new Date(date.year, date.month - 1, 1 - mondayFirstIndex);

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + index);

    return fromNativeDate(current);
  });
}

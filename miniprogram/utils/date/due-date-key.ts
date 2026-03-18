import { LocalDate } from '@/utils/date/local-date';

export function toDueDateKey(date: LocalDate): string {
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

export function parseDueDateKey(value: string): LocalDate {
  const [year, month, day] = value.split('-').map(Number);

  return new LocalDate(year, month, day);
}

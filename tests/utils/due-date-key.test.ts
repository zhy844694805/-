import { LocalDate } from '@/utils/date/local-date';
import { parseDueDateKey, toDueDateKey } from '@/utils/date/due-date-key';

describe('dueDateKey helpers', () => {
  it('formats YYYY-MM-DD', () => {
    expect(toDueDateKey(new LocalDate(2026, 3, 8))).toBe('2026-03-08');
  });

  it('parses YYYY-MM-DD back into a local date', () => {
    expect(parseDueDateKey('2026-11-02')).toEqual(new LocalDate(2026, 11, 2));
  });
});

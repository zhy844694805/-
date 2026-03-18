import { LocalDate } from '@/utils/date/local-date';
import { buildMonthWindow, isSameLocalDate, shiftMonth } from '@/utils/date/month-window';

describe('monthWindow helpers', () => {
  it('builds a 42-cell month grid for march 2026', () => {
    const windowDates = buildMonthWindow(new LocalDate(2026, 3, 18));

    expect(windowDates).toHaveLength(42);
  });

  it('backfills previous-month dates into the first row', () => {
    const windowDates = buildMonthWindow(new LocalDate(2026, 3, 18));

    expect(windowDates[0]).toEqual(new LocalDate(2026, 2, 23));
    expect(windowDates[6]).toEqual(new LocalDate(2026, 3, 1));
  });

  it('clamps invalid days when shifting months', () => {
    expect(shiftMonth(new LocalDate(2026, 1, 31), 1)).toEqual(new LocalDate(2026, 2, 28));
    expect(shiftMonth(new LocalDate(2024, 1, 31), 1)).toEqual(new LocalDate(2024, 2, 29));
  });

  it('compares dates by value', () => {
    expect(isSameLocalDate(new LocalDate(2026, 3, 18), new LocalDate(2026, 3, 18))).toBe(true);
    expect(isSameLocalDate(new LocalDate(2026, 3, 18), new LocalDate(2026, 3, 19))).toBe(false);
  });
});

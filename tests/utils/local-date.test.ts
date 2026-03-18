import { LocalDate } from '@/utils/date/local-date';

describe('LocalDate', () => {
  it('keeps the provided year month and day', () => {
    const date = new LocalDate(2026, 3, 18);

    expect(date.year).toBe(2026);
    expect(date.month).toBe(3);
    expect(date.day).toBe(18);
  });
});

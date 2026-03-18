import { ListRecord } from '@/models/list';
import { TaskRecord } from '@/models/task';
import { HomeVisibleScope, filterTasksForHomeScope } from '@/services/task-service';
import { LocalDate } from '@/utils/date/local-date';
import { parseDueDateKey, toDueDateKey } from '@/utils/date/due-date-key';
import { buildMonthWindow, shiftMonth } from '@/utils/date/month-window';

export interface MonthCellSummary {
  date: LocalDate;
  dueDateKey: string;
  isCurrentMonth: boolean;
  tasks: TaskRecord[];
}

export class HomeStore {
  readonly today: LocalDate;
  readonly viewerUserId: string;
  readonly viewerSpaceId: string | null;

  private tasks: TaskRecord[];
  private lists: Record<string, ListRecord>;

  selectedDate: LocalDate;
  visibleScope: HomeVisibleScope = 'all';
  private currentMonthAnchor: LocalDate;

  constructor(input: {
    today: LocalDate;
    viewerUserId: string;
    viewerSpaceId: string | null;
    tasks?: TaskRecord[];
    lists?: Record<string, ListRecord>;
  }) {
    this.today = input.today;
    this.viewerUserId = input.viewerUserId;
    this.viewerSpaceId = input.viewerSpaceId;
    this.tasks = input.tasks ?? [];
    this.lists = input.lists ?? {};
    this.selectedDate = input.today;
    this.currentMonthAnchor = new LocalDate(input.today.year, input.today.month, 1);
  }

  get selectedDueDateKey(): string {
    return toDueDateKey(this.selectedDate);
  }

  get monthTitle(): string {
    return `${this.currentMonthAnchor.year} 年 ${this.currentMonthAnchor.month} 月`;
  }

  get visibleTasks(): TaskRecord[] {
    return filterTasksForHomeScope({
      tasks: this.tasks,
      lists: this.lists,
      scope: this.visibleScope,
      viewerUserId: this.viewerUserId,
      viewerSpaceId: this.viewerSpaceId,
    });
  }

  get monthCells(): MonthCellSummary[] {
    const visibleTasksByDate = this.visibleTasks.reduce<Record<string, TaskRecord[]>>(
      (accumulator, task) => {
        if (!accumulator[task.dueDateKey]) {
          accumulator[task.dueDateKey] = [];
        }

        accumulator[task.dueDateKey].push(task);
        return accumulator;
      },
      {},
    );

    return buildMonthWindow(this.currentMonthAnchor).map((date) => {
      const dueDateKey = toDueDateKey(date);

      return {
        date,
        dueDateKey,
        isCurrentMonth:
          date.year === this.currentMonthAnchor.year && date.month === this.currentMonthAnchor.month,
        tasks: visibleTasksByDate[dueDateKey] ?? [],
      };
    });
  }

  get selectedDayTasks(): TaskRecord[] {
    return this.visibleTasks.filter((task) => task.dueDateKey === this.selectedDueDateKey);
  }

  setData(tasks: TaskRecord[], lists: Record<string, ListRecord>): void {
    this.tasks = tasks;
    this.lists = lists;
  }

  selectDate(date: LocalDate): void {
    this.selectedDate = date;
  }

  selectDateByKey(dueDateKey: string): void {
    this.selectDate(parseDueDateKey(dueDateKey));
  }

  goToToday(): void {
    this.selectedDate = this.today;
    this.currentMonthAnchor = new LocalDate(this.today.year, this.today.month, 1);
  }

  shiftMonth(delta: number): void {
    this.selectedDate = shiftMonth(this.selectedDate, delta);
    this.currentMonthAnchor = new LocalDate(this.selectedDate.year, this.selectedDate.month, 1);
  }

  setVisibleScope(scope: HomeVisibleScope): void {
    this.visibleScope = scope;
  }
}

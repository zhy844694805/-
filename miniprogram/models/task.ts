export interface TaskRecord {
  taskId: string;
  listId: string;
  title: string;
  dueDateKey: string;
  isCompleted: boolean;
  assigneeUserIds: string[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskMutationInput {
  taskId?: string;
  listId: string;
  title: string;
  dueDateKey: string;
  assigneeUserIds: string[];
}

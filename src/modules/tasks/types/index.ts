/**
 * Task Module Types
 */

export enum TaskStatus {
  TODO = 'TODO',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Task {
  id: string
  title: string
  description?: string
  code?: string
  status: TaskStatus
  priority: TaskPriority
  scheduledStart?: Date
  scheduledEnd?: Date
  actualStart?: Date
  actualEnd?: Date
  locationId?: string
  assignedToId?: string
  createdById: string
  equipmentId?: string
  checklist?: TaskChecklistItem[]
  photoUrls?: string[]
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface TaskChecklistItem {
  label: string
  checked: boolean
}

export interface TaskLog {
  id: string
  taskId: string
  userId: string
  action: string
  fromStatus?: TaskStatus
  toStatus?: TaskStatus
  notes?: string
  createdAt: Date
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: TaskPriority
  scheduledStart?: Date
  scheduledEnd?: Date
  locationId?: string
  equipmentId?: string
  assignedToId?: string
  checklist?: TaskChecklistItem[]
}

export interface UpdateTaskStatusInput {
  taskId: string
  newStatus: TaskStatus
  userId: string
  notes?: string
}

export interface AssignTaskInput {
  taskId: string
  userId: string
  assignedById: string
}

export interface StartTaskInput {
  taskId: string
  userId: string
}

export interface CompleteTaskInput {
  taskId: string
  userId: string
  notes?: string
}

// Business Rules
export const VALID_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.TODO]: [TaskStatus.ASSIGNED, TaskStatus.CANCELLED],
  [TaskStatus.ASSIGNED]: [TaskStatus.IN_PROGRESS, TaskStatus.TODO, TaskStatus.CANCELLED],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
  [TaskStatus.COMPLETED]: [], // Terminal state
  [TaskStatus.CANCELLED]: [], // Terminal state
}

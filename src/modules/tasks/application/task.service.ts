/**
 * Task Application Service
 *
 * Orchestrates task operations, domain logic, and persistence
 */

import { Task, TaskProps } from '../domain/task.entity'
import { TaskRepository } from '../infrastructure/task.repository'
import { TaskStatus, TaskPriority } from '@/types'
import { NotFoundError, ValidationError } from '@/lib/errors'
import { generateCode } from '@/lib/utils'

export interface CreateTaskDTO {
  title: string
  description?: string
  priority?: TaskPriority
  zoneId?: string
  assignedToId?: string
  equipmentId?: string
  scheduledStart?: Date
  scheduledEnd?: Date
  estimatedHours?: number
  checklistItems?: Array<{
    id: string
    text: string
    completed: boolean
  }>
  createdById: string
}

export interface UpdateTaskDTO {
  title?: string
  description?: string
  priority?: TaskPriority
  zoneId?: string
  assignedToId?: string
  equipmentId?: string
  scheduledStart?: Date
  scheduledEnd?: Date
  estimatedHours?: number
}

export interface TaskFilters {
  status?: TaskStatus
  assignedToId?: string
  zoneId?: string
  priority?: TaskPriority
  dateFrom?: Date
  dateTo?: Date
}

export class TaskService {
  constructor(private repository: TaskRepository) {}

  /**
   * Create a new task
   */
  async createTask(dto: CreateTaskDTO): Promise<Task> {
    // Generate unique code
    const code = await this.repository.generateNextCode()

    const now = new Date()
    const taskProps: TaskProps = {
      id: crypto.randomUUID(),
      code,
      title: dto.title,
      description: dto.description,
      status: TaskStatus.TODO,
      priority: dto.priority || TaskPriority.MEDIUM,
      zoneId: dto.zoneId,
      assignedToId: dto.assignedToId,
      equipmentId: dto.equipmentId,
      createdById: dto.createdById,
      scheduledStart: dto.scheduledStart,
      scheduledEnd: dto.scheduledEnd,
      estimatedHours: dto.estimatedHours,
      checklistItems: dto.checklistItems,
      createdAt: now,
      updatedAt: now,
    }

    const task = new Task(taskProps)

    // Persist
    await this.repository.save(task)

    // Log creation
    await this.repository.logStatusChange({
      taskId: task.id,
      userId: dto.createdById,
      fromStatus: null,
      toStatus: TaskStatus.TODO,
      notes: 'Task created',
    })

    return task
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<Task> {
    const task = await this.repository.findById(id)
    if (!task) {
      throw new NotFoundError('Task', id)
    }
    return task
  }

  /**
   * Get task by code
   */
  async getTaskByCode(code: string): Promise<Task> {
    const task = await this.repository.findByCode(code)
    if (!task) {
      throw new NotFoundError('Task', code)
    }
    return task
  }

  /**
   * List tasks with filters
   */
  async listTasks(
    filters: TaskFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ tasks: Task[]; total: number }> {
    return this.repository.findMany(filters, page, limit)
  }

  /**
   * Assign task to user
   */
  async assignTask(
    taskId: string,
    userId: string,
    assignedById: string
  ): Promise<Task> {
    const task = await this.getTaskById(taskId)

    task.assign(userId)

    await this.repository.save(task)
    await this.repository.logStatusChange({
      taskId: task.id,
      userId: assignedById,
      fromStatus: task.status,
      toStatus: task.status,
      notes: `Task assigned to user ${userId}`,
    })

    return task
  }

  /**
   * Start task
   */
  async startTask(taskId: string, userId: string): Promise<Task> {
    const task = await this.getTaskById(taskId)

    const previousStatus = task.status
    task.start(userId)

    await this.repository.save(task)
    await this.repository.logStatusChange({
      taskId: task.id,
      userId,
      fromStatus: previousStatus,
      toStatus: task.status,
      notes: 'Task started',
    })

    return task
  }

  /**
   * Put task on hold
   */
  async putTaskOnHold(
    taskId: string,
    userId: string,
    reason?: string
  ): Promise<Task> {
    const task = await this.getTaskById(taskId)

    const previousStatus = task.status
    task.putOnHold(reason)

    await this.repository.save(task)
    await this.repository.logStatusChange({
      taskId: task.id,
      userId,
      fromStatus: previousStatus,
      toStatus: task.status,
      notes: reason || 'Task put on hold',
    })

    return task
  }

  /**
   * Resume task from hold
   */
  async resumeTask(taskId: string, userId: string): Promise<Task> {
    const task = await this.getTaskById(taskId)

    const previousStatus = task.status
    task.resume()

    await this.repository.save(task)
    await this.repository.logStatusChange({
      taskId: task.id,
      userId,
      fromStatus: previousStatus,
      toStatus: task.status,
      notes: 'Task resumed',
    })

    return task
  }

  /**
   * Complete task
   */
  async completeTask(taskId: string, userId: string): Promise<Task> {
    const task = await this.getTaskById(taskId)

    const previousStatus = task.status
    task.complete()

    await this.repository.save(task)
    await this.repository.logStatusChange({
      taskId: task.id,
      userId,
      fromStatus: previousStatus,
      toStatus: task.status,
      notes: 'Task completed',
    })

    return task
  }

  /**
   * Cancel task
   */
  async cancelTask(
    taskId: string,
    userId: string,
    reason?: string
  ): Promise<Task> {
    const task = await this.getTaskById(taskId)

    const previousStatus = task.status
    task.cancel(reason)

    await this.repository.save(task)
    await this.repository.logStatusChange({
      taskId: task.id,
      userId,
      fromStatus: previousStatus,
      toStatus: task.status,
      notes: reason || 'Task cancelled',
    })

    return task
  }

  /**
   * Update checklist item
   */
  async updateChecklistItem(
    taskId: string,
    itemId: string,
    completed: boolean,
    userId: string
  ): Promise<Task> {
    const task = await this.getTaskById(taskId)

    task.updateChecklistItem(itemId, completed)

    await this.repository.save(task)

    return task
  }

  /**
   * Add photo to task
   */
  async addPhoto(taskId: string, photoUrl: string): Promise<Task> {
    const task = await this.getTaskById(taskId)

    task.addPhoto(photoUrl)

    await this.repository.save(task)

    return task
  }

  /**
   * Update task details (not status)
   */
  async updateTask(taskId: string, dto: UpdateTaskDTO): Promise<Task> {
    const task = await this.getTaskById(taskId)

    const props = task.toJSON
    const updated = new Task({
      ...props,
      title: dto.title ?? props.title,
      description: dto.description ?? props.description,
      priority: dto.priority ?? props.priority,
      zoneId: dto.zoneId ?? props.zoneId,
      assignedToId: dto.assignedToId ?? props.assignedToId,
      equipmentId: dto.equipmentId ?? props.equipmentId,
      scheduledStart: dto.scheduledStart ?? props.scheduledStart,
      scheduledEnd: dto.scheduledEnd ?? props.scheduledEnd,
      estimatedHours: dto.estimatedHours ?? props.estimatedHours,
      updatedAt: new Date(),
    })

    await this.repository.save(updated)

    return updated
  }

  /**
   * Delete task (soft delete)
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    // First cancel the task
    await this.cancelTask(taskId, userId, 'Task deleted')

    // Could implement soft delete here if needed
    // For now, just cancelling is sufficient
  }

  /**
   * Get tasks for a specific user
   */
  async getTasksForUser(userId: string): Promise<Task[]> {
    const { tasks } = await this.repository.findMany(
      { assignedToId: userId },
      1,
      100
    )
    return tasks
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<Task[]> {
    const { tasks } = await this.repository.findMany({}, 1, 1000)
    return tasks.filter(task => task.isOverdue())
  }
}

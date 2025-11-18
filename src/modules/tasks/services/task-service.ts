/**
 * Task Service
 * Business logic for task management
 */

import {
  TaskStatus,
  TaskPriority,
  VALID_STATUS_TRANSITIONS,
  type Task,
  type CreateTaskInput,
  type UpdateTaskStatusInput,
} from '../types'
import { ValidationError, NotFoundError } from '@/types'

export class TaskService {
  constructor(private prisma: any) {}

  /**
   * Create a new task
   */
  async createTask(input: CreateTaskInput, createdById: string): Promise<Task> {
    // Determine initial status
    const status = input.assignedToId ? TaskStatus.ASSIGNED : TaskStatus.TODO

    const task = await this.prisma.$transaction(async (tx: any) => {
      // Create the task
      const createdTask = await tx.task.create({
        data: {
          title: input.title,
          description: input.description,
          status,
          priority: input.priority || TaskPriority.MEDIUM,
          scheduledStart: input.scheduledStart,
          scheduledEnd: input.scheduledEnd,
          locationId: input.locationId,
          equipmentId: input.equipmentId,
          assignedToId: input.assignedToId,
          createdById,
          checklist: input.checklist ? JSON.parse(JSON.stringify(input.checklist)) : undefined,
        },
      })

      // Log creation
      await tx.taskLog.create({
        data: {
          taskId: createdTask.id,
          userId: createdById,
          action: 'CREATED',
          toStatus: status,
        },
      })

      // If assigned, log the assignment
      if (input.assignedToId) {
        await tx.taskLog.create({
          data: {
            taskId: createdTask.id,
            userId: createdById,
            action: 'ASSIGNED',
            toStatus: TaskStatus.ASSIGNED,
            notes: `Assigned to user ${input.assignedToId}`,
          },
        })
      }

      return createdTask
    })

    return task
  }

  /**
   * Update task status with validation
   */
  async updateTaskStatus(input: UpdateTaskStatusInput): Promise<Task> {
    const { taskId, newStatus, userId, notes } = input

    return this.prisma.$transaction(async (tx: any) => {
      // Find existing task
      const existingTask = await tx.task.findUnique({
        where: { id: taskId },
      })

      if (!existingTask) {
        throw new NotFoundError('Task')
      }

      // Validate status transition
      const validTransitions = VALID_STATUS_TRANSITIONS[existingTask.status as TaskStatus]
      if (!validTransitions.includes(newStatus)) {
        throw new ValidationError(
          `Invalid status transition from ${existingTask.status} to ${newStatus}`
        )
      }

      // Prepare update data
      const updateData: any = {
        status: newStatus,
      }

      // Set timestamps based on status
      if (newStatus === TaskStatus.IN_PROGRESS && !existingTask.actualStart) {
        updateData.actualStart = new Date()
      }

      if (newStatus === TaskStatus.COMPLETED && !existingTask.actualEnd) {
        updateData.actualEnd = new Date()
      }

      // Update the task
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: updateData,
      })

      // Log the status change
      await tx.taskLog.create({
        data: {
          taskId,
          userId,
          action: 'STATUS_CHANGED',
          fromStatus: existingTask.status,
          toStatus: newStatus,
          notes,
        },
      })

      return updatedTask
    })
  }

  /**
   * Assign a task to a user
   */
  async assignTask(taskId: string, assignedToId: string, assignedById: string): Promise<Task> {
    return this.prisma.$transaction(async (tx: any) => {
      const existingTask = await tx.task.findUnique({
        where: { id: taskId },
      })

      if (!existingTask) {
        throw new NotFoundError('Task')
      }

      // Update task
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          assignedToId,
          status: TaskStatus.ASSIGNED,
        },
      })

      // Log the assignment
      await tx.taskLog.create({
        data: {
          taskId,
          userId: assignedById,
          action: 'ASSIGNED',
          fromStatus: existingTask.status,
          toStatus: TaskStatus.ASSIGNED,
          notes: `Assigned to user ${assignedToId}`,
        },
      })

      return updatedTask
    })
  }

  /**
   * Start a task (move to IN_PROGRESS)
   */
  async startTask(taskId: string, userId: string): Promise<Task> {
    return this.updateTaskStatus({
      taskId,
      newStatus: TaskStatus.IN_PROGRESS,
      userId,
      notes: 'Task started',
    })
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: string, userId: string, notes?: string): Promise<Task> {
    return this.updateTaskStatus({
      taskId,
      newStatus: TaskStatus.COMPLETED,
      userId,
      notes: notes || 'Task completed',
    })
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string, userId: string, reason?: string): Promise<Task> {
    return this.updateTaskStatus({
      taskId,
      newStatus: TaskStatus.CANCELLED,
      userId,
      notes: reason || 'Task cancelled',
    })
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        location: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        equipment: true,
      },
    })
  }

  /**
   * List tasks with filters
   */
  async listTasks(filters: {
    status?: TaskStatus
    priority?: TaskPriority
    assignedToId?: string
    locationId?: string
    fromDate?: Date
    toDate?: Date
    page?: number
    pageSize?: number
  }): Promise<{ tasks: Task[]; total: number }> {
    const page = filters.page || 1
    const pageSize = filters.pageSize || 20
    const skip = (page - 1) * pageSize

    const where: any = {}

    if (filters.status) where.status = filters.status
    if (filters.priority) where.priority = filters.priority
    if (filters.assignedToId) where.assignedToId = filters.assignedToId
    if (filters.locationId) where.locationId = filters.locationId

    if (filters.fromDate || filters.toDate) {
      where.scheduledStart = {}
      if (filters.fromDate) where.scheduledStart.gte = filters.fromDate
      if (filters.toDate) where.scheduledStart.lte = filters.toDate
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
          location: true,
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          equipment: true,
        },
        orderBy: [{ priority: 'desc' }, { scheduledStart: 'asc' }],
        skip,
        take: pageSize,
      }),
      this.prisma.task.count({ where }),
    ])

    return { tasks, total }
  }

  /**
   * Get task logs
   */
  async getTaskLogs(taskId: string): Promise<any[]> {
    return this.prisma.taskLog.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}

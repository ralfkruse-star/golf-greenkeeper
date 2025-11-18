/**
 * Task Repository
 *
 * Persistence layer for Task aggregate
 */

import { Task, TaskProps } from '../domain/task.entity'
import { TaskFilters } from '../application/task.service'
import { TaskStatus } from '@/types'
import prisma from '@/lib/db'
import { generateCode } from '@/lib/utils'

export interface TaskLogDTO {
  taskId: string
  userId: string
  fromStatus: TaskStatus | null
  toStatus: TaskStatus
  notes?: string
}

export class TaskRepository {
  /**
   * Save or update a task
   */
  async save(task: Task): Promise<void> {
    const props = task.toJSON

    await prisma.task.upsert({
      where: { id: props.id },
      create: {
        id: props.id,
        code: props.code,
        title: props.title,
        description: props.description,
        status: props.status,
        priority: props.priority,
        zoneId: props.zoneId,
        assignedToId: props.assignedToId,
        createdById: props.createdById,
        equipmentId: props.equipmentId,
        scheduledStart: props.scheduledStart,
        scheduledEnd: props.scheduledEnd,
        actualStart: props.actualStart,
        actualEnd: props.actualEnd,
        estimatedHours: props.estimatedHours,
        actualHours: props.actualHours,
        checklistItems: props.checklistItems || [],
        photoUrls: props.photoUrls || [],
        metadata: props.metadata || {},
      },
      update: {
        title: props.title,
        description: props.description,
        status: props.status,
        priority: props.priority,
        zoneId: props.zoneId,
        assignedToId: props.assignedToId,
        equipmentId: props.equipmentId,
        scheduledStart: props.scheduledStart,
        scheduledEnd: props.scheduledEnd,
        actualStart: props.actualStart,
        actualEnd: props.actualEnd,
        estimatedHours: props.estimatedHours,
        actualHours: props.actualHours,
        checklistItems: props.checklistItems || [],
        photoUrls: props.photoUrls || [],
        metadata: props.metadata || {},
        updatedAt: new Date(),
      },
    })
  }

  /**
   * Find task by ID
   */
  async findById(id: string): Promise<Task | null> {
    const record = await prisma.task.findUnique({
      where: { id },
    })

    return record ? this.toDomain(record) : null
  }

  /**
   * Find task by code
   */
  async findByCode(code: string): Promise<Task | null> {
    const record = await prisma.task.findUnique({
      where: { code },
    })

    return record ? this.toDomain(record) : null
  }

  /**
   * Find many tasks with filters and pagination
   */
  async findMany(
    filters: TaskFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ tasks: Task[]; total: number }> {
    const where: any = {}

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId
    }

    if (filters.zoneId) {
      where.zoneId = filters.zoneId
    }

    if (filters.priority) {
      where.priority = filters.priority
    }

    if (filters.dateFrom || filters.dateTo) {
      where.scheduledStart = {}
      if (filters.dateFrom) {
        where.scheduledStart.gte = filters.dateFrom
      }
      if (filters.dateTo) {
        where.scheduledStart.lte = filters.dateTo
      }
    }

    const [records, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { scheduledStart: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.task.count({ where }),
    ])

    return {
      tasks: records.map((r: any) => this.toDomain(r)),
      total,
    }
  }

  /**
   * Log status change
   */
  async logStatusChange(dto: TaskLogDTO): Promise<void> {
    await prisma.taskLog.create({
      data: {
        taskId: dto.taskId,
        userId: dto.userId,
        fromStatus: dto.fromStatus,
        toStatus: dto.toStatus,
        notes: dto.notes,
      },
    })
  }

  /**
   * Generate next task code
   */
  async generateNextCode(): Promise<string> {
    const lastTask = await prisma.task.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    })

    if (!lastTask) {
      return 'TASK-001'
    }

    // Extract number from code like "TASK-042"
    const match = lastTask.code.match(/TASK-(\d+)/)
    if (match) {
      const num = parseInt(match[1], 10) + 1
      return generateCode('TASK', num, 3)
    }

    return 'TASK-001'
  }

  /**
   * Convert Prisma record to Domain entity
   */
  private toDomain(record: any): Task {
    const props: TaskProps = {
      id: record.id,
      code: record.code,
      title: record.title,
      description: record.description,
      status: record.status as TaskStatus,
      priority: record.priority,
      zoneId: record.zoneId,
      assignedToId: record.assignedToId,
      createdById: record.createdById,
      equipmentId: record.equipmentId,
      scheduledStart: record.scheduledStart,
      scheduledEnd: record.scheduledEnd,
      actualStart: record.actualStart,
      actualEnd: record.actualEnd,
      estimatedHours: record.estimatedHours,
      actualHours: record.actualHours,
      checklistItems: Array.isArray(record.checklistItems)
        ? record.checklistItems
        : undefined,
      photoUrls: Array.isArray(record.photoUrls)
        ? record.photoUrls
        : undefined,
      metadata: typeof record.metadata === 'object'
        ? record.metadata
        : undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }

    return new Task(props)
  }
}

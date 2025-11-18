/**
 * Task Entity - Domain Model
 *
 * Represents a maintenance task with state management and business rules
 */

import { TaskStatus, TaskPriority } from '@/types'
import { BusinessRuleViolationError } from '@/lib/errors'

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface TaskProps {
  id: string
  code: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority

  zoneId?: string
  assignedToId?: string
  createdById: string
  equipmentId?: string

  scheduledStart?: Date
  scheduledEnd?: Date
  actualStart?: Date
  actualEnd?: Date

  estimatedHours?: number
  actualHours?: number

  checklistItems?: ChecklistItem[]
  photoUrls?: string[]
  metadata?: Record<string, unknown>

  createdAt: Date
  updatedAt: Date
}

export class Task {
  private props: TaskProps

  constructor(props: TaskProps) {
    this.props = props
  }

  // Getters
  get id(): string {
    return this.props.id
  }

  get code(): string {
    return this.props.code
  }

  get status(): TaskStatus {
    return this.props.status
  }

  get priority(): TaskPriority {
    return this.props.priority
  }

  get assignedToId(): string | undefined {
    return this.props.assignedToId
  }

  get actualStart(): Date | undefined {
    return this.props.actualStart
  }

  get actualEnd(): Date | undefined {
    return this.props.actualEnd
  }

  get toJSON(): TaskProps {
    return { ...this.props }
  }

  /**
   * Assign task to a user
   */
  assign(userId: string): void {
    if (this.props.status === TaskStatus.COMPLETED) {
      throw new BusinessRuleViolationError('Cannot assign a completed task')
    }

    if (this.props.status === TaskStatus.CANCELLED) {
      throw new BusinessRuleViolationError('Cannot assign a cancelled task')
    }

    this.props.assignedToId = userId
    this.props.updatedAt = new Date()
  }

  /**
   * Start task execution
   * Business Rule: Can only start from TODO or ON_HOLD status
   */
  start(userId: string): void {
    // Validate state transition
    if (this.props.status === TaskStatus.COMPLETED) {
      throw new BusinessRuleViolationError('Cannot start a completed task')
    }

    if (this.props.status === TaskStatus.CANCELLED) {
      throw new BusinessRuleViolationError('Cannot start a cancelled task')
    }

    if (this.props.status === TaskStatus.IN_PROGRESS) {
      throw new BusinessRuleViolationError('Task is already in progress')
    }

    // Auto-assign if not assigned
    if (!this.props.assignedToId) {
      this.props.assignedToId = userId
    }

    // Validate assignment
    if (this.props.assignedToId !== userId) {
      throw new BusinessRuleViolationError(
        'Only the assigned user can start this task'
      )
    }

    this.props.status = TaskStatus.IN_PROGRESS
    this.props.actualStart = new Date()
    this.props.updatedAt = new Date()
  }

  /**
   * Put task on hold
   * Business Rule: Can only put on hold if in progress
   */
  putOnHold(reason?: string): void {
    if (this.props.status !== TaskStatus.IN_PROGRESS) {
      throw new BusinessRuleViolationError(
        'Can only put on hold a task that is in progress'
      )
    }

    this.props.status = TaskStatus.ON_HOLD
    this.props.updatedAt = new Date()
  }

  /**
   * Resume task from on hold
   */
  resume(): void {
    if (this.props.status !== TaskStatus.ON_HOLD) {
      throw new BusinessRuleViolationError('Task is not on hold')
    }

    this.props.status = TaskStatus.IN_PROGRESS
    this.props.updatedAt = new Date()
  }

  /**
   * Complete task
   * Business Rule: Must be IN_PROGRESS to complete
   */
  complete(): void {
    if (this.props.status !== TaskStatus.IN_PROGRESS) {
      throw new BusinessRuleViolationError(
        'Can only complete a task that is in progress'
      )
    }

    // Validate checklist completion (if exists)
    if (this.props.checklistItems && this.props.checklistItems.length > 0) {
      const allCompleted = this.props.checklistItems.every(item => item.completed)
      if (!allCompleted) {
        throw new BusinessRuleViolationError(
          'All checklist items must be completed before finishing the task'
        )
      }
    }

    this.props.status = TaskStatus.COMPLETED
    this.props.actualEnd = new Date()

    // Calculate actual hours if start time exists
    if (this.props.actualStart && this.props.actualEnd) {
      const durationMs = this.props.actualEnd.getTime() - this.props.actualStart.getTime()
      this.props.actualHours = durationMs / (1000 * 60 * 60) // Convert to hours
    }

    this.props.updatedAt = new Date()
  }

  /**
   * Cancel task
   */
  cancel(reason?: string): void {
    if (this.props.status === TaskStatus.COMPLETED) {
      throw new BusinessRuleViolationError('Cannot cancel a completed task')
    }

    if (this.props.status === TaskStatus.CANCELLED) {
      throw new BusinessRuleViolationError('Task is already cancelled')
    }

    this.props.status = TaskStatus.CANCELLED
    this.props.updatedAt = new Date()
  }

  /**
   * Update checklist item
   */
  updateChecklistItem(itemId: string, completed: boolean): void {
    if (!this.props.checklistItems) {
      throw new BusinessRuleViolationError('Task has no checklist')
    }

    const item = this.props.checklistItems.find(i => i.id === itemId)
    if (!item) {
      throw new BusinessRuleViolationError(`Checklist item ${itemId} not found`)
    }

    item.completed = completed
    this.props.updatedAt = new Date()
  }

  /**
   * Add photo URL
   */
  addPhoto(url: string): void {
    if (!this.props.photoUrls) {
      this.props.photoUrls = []
    }

    this.props.photoUrls.push(url)
    this.props.updatedAt = new Date()
  }

  /**
   * Check if task is overdue
   */
  isOverdue(): boolean {
    if (!this.props.scheduledEnd) {
      return false
    }

    if (this.props.status === TaskStatus.COMPLETED) {
      return false
    }

    return new Date() > this.props.scheduledEnd
  }

  /**
   * Check if task is completed on time
   */
  isCompletedOnTime(): boolean {
    if (this.props.status !== TaskStatus.COMPLETED) {
      return false
    }

    if (!this.props.scheduledEnd || !this.props.actualEnd) {
      return true // No deadline or no completion time
    }

    return this.props.actualEnd <= this.props.scheduledEnd
  }
}

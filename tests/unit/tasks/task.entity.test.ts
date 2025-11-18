/**
 * Task Entity - Unit Tests
 *
 * Testing business rules and state transitions
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Task, TaskProps } from '@/modules/tasks/domain/task.entity'
import { TaskStatus, TaskPriority } from '@/types'
import { BusinessRuleViolationError } from '@/lib/errors'

describe('Task Entity', () => {
  let defaultProps: TaskProps

  beforeEach(() => {
    defaultProps = {
      id: 'task-1',
      code: 'TASK-001',
      title: 'Mow Green 1',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      createdById: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  })

  describe('Task Creation', () => {
    it('should create a task with valid properties', () => {
      const task = new Task(defaultProps)

      expect(task.id).toBe('task-1')
      expect(task.code).toBe('TASK-001')
      expect(task.status).toBe(TaskStatus.TODO)
    })
  })

  describe('Task Assignment', () => {
    it('should assign task to a user', () => {
      const task = new Task(defaultProps)

      task.assign('user-2')

      expect(task.assignedToId).toBe('user-2')
    })

    it('should not assign a completed task', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.COMPLETED,
      })

      expect(() => task.assign('user-2')).toThrow(BusinessRuleViolationError)
      expect(() => task.assign('user-2')).toThrow('Cannot assign a completed task')
    })

    it('should not assign a cancelled task', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.CANCELLED,
      })

      expect(() => task.assign('user-2')).toThrow(BusinessRuleViolationError)
      expect(() => task.assign('user-2')).toThrow('Cannot assign a cancelled task')
    })
  })

  describe('Task Start', () => {
    it('should start a task from TODO status', () => {
      const task = new Task({
        ...defaultProps,
        assignedToId: 'user-1',
      })

      task.start('user-1')

      expect(task.status).toBe(TaskStatus.IN_PROGRESS)
      expect(task.actualStart).toBeDefined()
      expect(task.actualStart).toBeInstanceOf(Date)
    })

    it('should auto-assign when starting unassigned task', () => {
      const task = new Task(defaultProps)

      task.start('user-2')

      expect(task.assignedToId).toBe('user-2')
      expect(task.status).toBe(TaskStatus.IN_PROGRESS)
    })

    it('should start a task from ON_HOLD status', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.ON_HOLD,
        assignedToId: 'user-1',
      })

      task.start('user-1')

      expect(task.status).toBe(TaskStatus.IN_PROGRESS)
    })

    it('should not start if already in progress', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.IN_PROGRESS,
        assignedToId: 'user-1',
      })

      expect(() => task.start('user-1')).toThrow(BusinessRuleViolationError)
      expect(() => task.start('user-1')).toThrow('already in progress')
    })

    it('should not start a completed task', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.COMPLETED,
      })

      expect(() => task.start('user-1')).toThrow(BusinessRuleViolationError)
      expect(() => task.start('user-1')).toThrow('Cannot start a completed task')
    })

    it('should not start a cancelled task', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.CANCELLED,
      })

      expect(() => task.start('user-1')).toThrow(BusinessRuleViolationError)
    })

    it('should not allow different user to start assigned task', () => {
      const task = new Task({
        ...defaultProps,
        assignedToId: 'user-1',
      })

      expect(() => task.start('user-2')).toThrow(BusinessRuleViolationError)
      expect(() => task.start('user-2')).toThrow('Only the assigned user can start')
    })
  })

  describe('Task Completion', () => {
    it('should complete a task that is in progress', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.IN_PROGRESS,
        actualStart: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      })

      task.complete()

      expect(task.status).toBe(TaskStatus.COMPLETED)
      expect(task.actualEnd).toBeDefined()
      expect(task.actualEnd).toBeInstanceOf(Date)
    })

    it('should calculate actual hours on completion', () => {
      const startTime = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.IN_PROGRESS,
        actualStart: startTime,
      })

      task.complete()

      expect(task.toJSON.actualHours).toBeDefined()
      expect(task.toJSON.actualHours).toBeGreaterThan(1.9)
      expect(task.toJSON.actualHours).toBeLessThan(2.1)
    })

    it('should not complete a task that is not in progress', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.TODO,
      })

      expect(() => task.complete()).toThrow(BusinessRuleViolationError)
      expect(() => task.complete()).toThrow('Can only complete a task that is in progress')
    })

    it('should not complete task with incomplete checklist', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.IN_PROGRESS,
        checklistItems: [
          { id: '1', text: 'Item 1', completed: true },
          { id: '2', text: 'Item 2', completed: false },
        ],
      })

      expect(() => task.complete()).toThrow(BusinessRuleViolationError)
      expect(() => task.complete()).toThrow('All checklist items must be completed')
    })

    it('should complete task with all checklist items completed', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.IN_PROGRESS,
        checklistItems: [
          { id: '1', text: 'Item 1', completed: true },
          { id: '2', text: 'Item 2', completed: true },
        ],
      })

      task.complete()

      expect(task.status).toBe(TaskStatus.COMPLETED)
    })
  })

  describe('Task On Hold', () => {
    it('should put in-progress task on hold', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.IN_PROGRESS,
      })

      task.putOnHold('Weather conditions')

      expect(task.status).toBe(TaskStatus.ON_HOLD)
    })

    it('should not put non-in-progress task on hold', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.TODO,
      })

      expect(() => task.putOnHold()).toThrow(BusinessRuleViolationError)
    })

    it('should resume task from on hold', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.ON_HOLD,
      })

      task.resume()

      expect(task.status).toBe(TaskStatus.IN_PROGRESS)
    })

    it('should not resume task that is not on hold', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.TODO,
      })

      expect(() => task.resume()).toThrow(BusinessRuleViolationError)
    })
  })

  describe('Task Cancellation', () => {
    it('should cancel a task', () => {
      const task = new Task(defaultProps)

      task.cancel('No longer needed')

      expect(task.status).toBe(TaskStatus.CANCELLED)
    })

    it('should not cancel a completed task', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.COMPLETED,
      })

      expect(() => task.cancel()).toThrow(BusinessRuleViolationError)
      expect(() => task.cancel()).toThrow('Cannot cancel a completed task')
    })

    it('should not cancel an already cancelled task', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.CANCELLED,
      })

      expect(() => task.cancel()).toThrow(BusinessRuleViolationError)
    })
  })

  describe('Checklist Management', () => {
    it('should update checklist item', () => {
      const task = new Task({
        ...defaultProps,
        checklistItems: [
          { id: '1', text: 'Item 1', completed: false },
        ],
      })

      task.updateChecklistItem('1', true)

      expect(task.toJSON.checklistItems?.[0].completed).toBe(true)
    })

    it('should throw error if checklist item not found', () => {
      const task = new Task({
        ...defaultProps,
        checklistItems: [
          { id: '1', text: 'Item 1', completed: false },
        ],
      })

      expect(() => task.updateChecklistItem('999', true)).toThrow(BusinessRuleViolationError)
    })

    it('should throw error if task has no checklist', () => {
      const task = new Task(defaultProps)

      expect(() => task.updateChecklistItem('1', true)).toThrow(BusinessRuleViolationError)
      expect(() => task.updateChecklistItem('1', true)).toThrow('Task has no checklist')
    })
  })

  describe('Photo Management', () => {
    it('should add photo URL', () => {
      const task = new Task(defaultProps)

      task.addPhoto('https://example.com/photo1.jpg')
      task.addPhoto('https://example.com/photo2.jpg')

      expect(task.toJSON.photoUrls).toHaveLength(2)
      expect(task.toJSON.photoUrls).toContain('https://example.com/photo1.jpg')
    })
  })

  describe('Task Status Checks', () => {
    it('should identify overdue task', () => {
      const task = new Task({
        ...defaultProps,
        scheduledEnd: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      })

      expect(task.isOverdue()).toBe(true)
    })

    it('should not identify completed task as overdue', () => {
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.COMPLETED,
        scheduledEnd: new Date(Date.now() - 24 * 60 * 60 * 1000),
      })

      expect(task.isOverdue()).toBe(false)
    })

    it('should identify task completed on time', () => {
      const scheduledEnd = new Date(Date.now() + 24 * 60 * 60 * 1000) // tomorrow
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.COMPLETED,
        scheduledEnd,
        actualEnd: new Date(), // completed today
      })

      expect(task.isCompletedOnTime()).toBe(true)
    })

    it('should identify late completion', () => {
      const scheduledEnd = new Date(Date.now() - 24 * 60 * 60 * 1000) // yesterday
      const task = new Task({
        ...defaultProps,
        status: TaskStatus.COMPLETED,
        scheduledEnd,
        actualEnd: new Date(), // completed today
      })

      expect(task.isCompletedOnTime()).toBe(false)
    })
  })
})

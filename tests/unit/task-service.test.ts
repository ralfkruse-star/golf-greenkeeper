/**
 * Task Service Unit Tests
 * Tests for Task Business Logic (TDD)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TaskService } from '@/modules/tasks/services/task-service'
import { TaskStatus, TaskPriority } from '@/modules/tasks/types'
import type { Task, CreateTaskInput, UpdateTaskStatusInput } from '@/modules/tasks/types'

describe('TaskService', () => {
  let taskService: TaskService
  let mockPrisma: any

  beforeEach(() => {
    // Create a mock Prisma client
    mockPrisma = {
      task: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      taskLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(mockPrisma)),
    }

    taskService = new TaskService(mockPrisma)
  })

  describe('createTask', () => {
    it('should create a task with default status TODO', async () => {
      const input: CreateTaskInput = {
        title: 'Grün 1 mähen',
        description: 'Schnitthöhe 3.5mm',
        priority: TaskPriority.HIGH,
      }

      const createdTask: Task = {
        id: 'task-1',
        title: input.title,
        description: input.description,
        status: TaskStatus.TODO,
        priority: input.priority!,
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.task.create.mockResolvedValue(createdTask)

      const result = await taskService.createTask(input, 'user-1')

      expect(result.status).toBe(TaskStatus.TODO)
      expect(result.title).toBe(input.title)
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: input.title,
          description: input.description,
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          createdById: 'user-1',
        }),
      })
    })

    it('should create a task with assigned status if assignedToId is provided', async () => {
      const input: CreateTaskInput = {
        title: 'Fairway mähen',
        assignedToId: 'greenkeeper-1',
      }

      const createdTask: Task = {
        id: 'task-2',
        title: input.title,
        status: TaskStatus.ASSIGNED,
        priority: TaskPriority.MEDIUM,
        assignedToId: 'greenkeeper-1',
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.task.create.mockResolvedValue(createdTask)
      mockPrisma.taskLog.create.mockResolvedValue({})

      const result = await taskService.createTask(input, 'user-1')

      expect(result.status).toBe(TaskStatus.ASSIGNED)
      expect(result.assignedToId).toBe('greenkeeper-1')
    })
  })

  describe('updateTaskStatus - Status Transitions', () => {
    it('should allow transition from TODO to ASSIGNED', async () => {
      const existingTask: Task = {
        id: 'task-1',
        title: 'Test Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedTask = { ...existingTask, status: TaskStatus.ASSIGNED }

      mockPrisma.task.findUnique.mockResolvedValue(existingTask)
      mockPrisma.task.update.mockResolvedValue(updatedTask)
      mockPrisma.taskLog.create.mockResolvedValue({})

      const input: UpdateTaskStatusInput = {
        taskId: 'task-1',
        newStatus: TaskStatus.ASSIGNED,
        userId: 'user-1',
      }

      const result = await taskService.updateTaskStatus(input)

      expect(result.status).toBe(TaskStatus.ASSIGNED)
      expect(mockPrisma.taskLog.create).toHaveBeenCalled()
    })

    it('should allow transition from ASSIGNED to IN_PROGRESS', async () => {
      const existingTask: Task = {
        id: 'task-1',
        title: 'Test Task',
        status: TaskStatus.ASSIGNED,
        priority: TaskPriority.MEDIUM,
        assignedToId: 'user-1',
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedTask = {
        ...existingTask,
        status: TaskStatus.IN_PROGRESS,
        actualStart: new Date(),
      }

      mockPrisma.task.findUnique.mockResolvedValue(existingTask)
      mockPrisma.task.update.mockResolvedValue(updatedTask)
      mockPrisma.taskLog.create.mockResolvedValue({})

      const input: UpdateTaskStatusInput = {
        taskId: 'task-1',
        newStatus: TaskStatus.IN_PROGRESS,
        userId: 'user-1',
      }

      const result = await taskService.updateTaskStatus(input)

      expect(result.status).toBe(TaskStatus.IN_PROGRESS)
      expect(result.actualStart).toBeDefined()
    })

    it('should allow transition from IN_PROGRESS to COMPLETED', async () => {
      const existingTask: Task = {
        id: 'task-1',
        title: 'Test Task',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        actualStart: new Date(),
        assignedToId: 'user-1',
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedTask = {
        ...existingTask,
        status: TaskStatus.COMPLETED,
        actualEnd: new Date(),
      }

      mockPrisma.task.findUnique.mockResolvedValue(existingTask)
      mockPrisma.task.update.mockResolvedValue(updatedTask)
      mockPrisma.taskLog.create.mockResolvedValue({})

      const input: UpdateTaskStatusInput = {
        taskId: 'task-1',
        newStatus: TaskStatus.COMPLETED,
        userId: 'user-1',
      }

      const result = await taskService.updateTaskStatus(input)

      expect(result.status).toBe(TaskStatus.COMPLETED)
      expect(result.actualEnd).toBeDefined()
    })

    it('should NOT allow direct transition from TODO to COMPLETED', async () => {
      const existingTask: Task = {
        id: 'task-1',
        title: 'Test Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.task.findUnique.mockResolvedValue(existingTask)

      const input: UpdateTaskStatusInput = {
        taskId: 'task-1',
        newStatus: TaskStatus.COMPLETED,
        userId: 'user-1',
      }

      await expect(taskService.updateTaskStatus(input)).rejects.toThrow(
        'Invalid status transition from TODO to COMPLETED'
      )
    })

    it('should NOT allow transition from COMPLETED to any other status', async () => {
      const existingTask: Task = {
        id: 'task-1',
        title: 'Test Task',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.MEDIUM,
        actualStart: new Date(),
        actualEnd: new Date(),
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.task.findUnique.mockResolvedValue(existingTask)

      const input: UpdateTaskStatusInput = {
        taskId: 'task-1',
        newStatus: TaskStatus.IN_PROGRESS,
        userId: 'user-1',
      }

      await expect(taskService.updateTaskStatus(input)).rejects.toThrow(
        'Invalid status transition from COMPLETED to IN_PROGRESS'
      )
    })
  })

  describe('assignTask', () => {
    it('should assign a task and update status to ASSIGNED', async () => {
      const existingTask: Task = {
        id: 'task-1',
        title: 'Test Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedTask = {
        ...existingTask,
        status: TaskStatus.ASSIGNED,
        assignedToId: 'greenkeeper-1',
      }

      mockPrisma.task.findUnique.mockResolvedValue(existingTask)
      mockPrisma.task.update.mockResolvedValue(updatedTask)
      mockPrisma.taskLog.create.mockResolvedValue({})

      const result = await taskService.assignTask('task-1', 'greenkeeper-1', 'user-1')

      expect(result.status).toBe(TaskStatus.ASSIGNED)
      expect(result.assignedToId).toBe('greenkeeper-1')
    })
  })

  describe('startTask', () => {
    it('should start a task and set actualStart timestamp', async () => {
      const existingTask: Task = {
        id: 'task-1',
        title: 'Test Task',
        status: TaskStatus.ASSIGNED,
        priority: TaskPriority.MEDIUM,
        assignedToId: 'user-1',
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedTask = {
        ...existingTask,
        status: TaskStatus.IN_PROGRESS,
        actualStart: new Date(),
      }

      mockPrisma.task.findUnique.mockResolvedValue(existingTask)
      mockPrisma.task.update.mockResolvedValue(updatedTask)
      mockPrisma.taskLog.create.mockResolvedValue({})

      const result = await taskService.startTask('task-1', 'user-1')

      expect(result.status).toBe(TaskStatus.IN_PROGRESS)
      expect(result.actualStart).toBeDefined()
    })
  })

  describe('completeTask', () => {
    it('should complete a task and set actualEnd timestamp', async () => {
      const actualStart = new Date(Date.now() - 3600000) // 1 hour ago

      const existingTask: Task = {
        id: 'task-1',
        title: 'Test Task',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        actualStart,
        assignedToId: 'user-1',
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedTask = {
        ...existingTask,
        status: TaskStatus.COMPLETED,
        actualEnd: new Date(),
      }

      mockPrisma.task.findUnique.mockResolvedValue(existingTask)
      mockPrisma.task.update.mockResolvedValue(updatedTask)
      mockPrisma.taskLog.create.mockResolvedValue({})

      const result = await taskService.completeTask('task-1', 'user-1')

      expect(result.status).toBe(TaskStatus.COMPLETED)
      expect(result.actualEnd).toBeDefined()
      expect(result.actualEnd!.getTime()).toBeGreaterThan(actualStart.getTime())
    })
  })
})

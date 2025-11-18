/**
 * Integration Tests: Tasks API
 *
 * Tests the /api/tasks endpoints with real HTTP requests
 */

import { describe, it, expect, beforeAll } from 'vitest'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

describe('Tasks API Integration', () => {
  let accessToken: string
  let testTaskId: string

  beforeAll(async () => {
    // Login to get access token
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@golfclub.de',
        password: 'admin123',
      }),
    })
    const data = await response.json()
    accessToken = data.data.accessToken
  })

  describe('GET /api/tasks', () => {
    it('should get list of tasks', async () => {
      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data.length).toBeGreaterThan(0)

      // Check task structure
      const task = data.data[0]
      expect(task).toHaveProperty('id')
      expect(task).toHaveProperty('code')
      expect(task).toHaveProperty('title')
      expect(task).toHaveProperty('status')
      expect(task).toHaveProperty('priority')

      // Store task ID for other tests
      testTaskId = task.id
    })

    it('should filter tasks by status', async () => {
      const response = await fetch(`${API_URL}/api/tasks?status=TODO`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)

      // All tasks should have TODO status
      data.data.forEach((task: any) => {
        expect(task.status).toBe('TODO')
      })
    })

    it('should filter tasks by priority', async () => {
      const response = await fetch(`${API_URL}/api/tasks?priority=HIGH`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)

      // All tasks should have HIGH priority
      data.data.forEach((task: any) => {
        expect(task.priority).toBe('HIGH')
      })
    })

    it('should reject request without authentication', async () => {
      const response = await fetch(`${API_URL}/api/tasks`)

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.success).toBe(false)
    })
  })

  describe('GET /api/tasks/[id]', () => {
    it('should get task by ID', async () => {
      const response = await fetch(`${API_URL}/api/tasks/${testTaskId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('id', testTaskId)
      expect(data.data).toHaveProperty('code')
      expect(data.data).toHaveProperty('title')
    })

    it('should return 404 for non-existent task', async () => {
      const response = await fetch(`${API_URL}/api/tasks/non-existent-id`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.status).toBe(404)

      const data = await response.json()
      expect(data.success).toBe(false)
    })
  })

  describe('POST /api/tasks', () => {
    it('should create new task', async () => {
      const newTask = {
        code: `TEST-TASK-${Date.now()}`,
        title: 'Integration Test Task',
        description: 'Created during integration testing',
        priority: 'MEDIUM',
        status: 'TODO',
        estimatedDuration: 60,
      }

      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newTask),
      })

      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('id')
      expect(data.data.code).toBe(newTask.code)
      expect(data.data.title).toBe(newTask.title)
      expect(data.data.priority).toBe(newTask.priority)
    })

    it('should reject task with missing required fields', async () => {
      const invalidTask = {
        description: 'Missing title and code',
      }

      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(invalidTask),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
    })

    it('should reject task with invalid priority', async () => {
      const invalidTask = {
        code: `TEST-INVALID-${Date.now()}`,
        title: 'Invalid Task',
        priority: 'SUPER_URGENT', // Invalid priority
      }

      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(invalidTask),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
    })
  })

  describe('PATCH /api/tasks/[id]', () => {
    it('should update task', async () => {
      const update = {
        status: 'IN_PROGRESS',
        priority: 'URGENT',
      }

      const response = await fetch(`${API_URL}/api/tasks/${testTaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(update),
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.status).toBe(update.status)
      expect(data.data.priority).toBe(update.priority)
    })

    it('should return 404 for updating non-existent task', async () => {
      const response = await fetch(`${API_URL}/api/tasks/non-existent-id`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/tasks/[id]', () => {
    it('should delete task', async () => {
      // First create a task to delete
      const newTask = {
        code: `TEST-DELETE-${Date.now()}`,
        title: 'Task to Delete',
        priority: 'LOW',
      }

      const createResponse = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newTask),
      })

      const createData = await createResponse.json()
      const taskId = createData.data.id

      // Now delete it
      const deleteResponse = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(deleteResponse.status).toBe(200)

      const deleteData = await deleteResponse.json()
      expect(deleteData.success).toBe(true)

      // Verify it's deleted
      const getResponse = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(getResponse.status).toBe(404)
    })

    it('should return 404 for deleting non-existent task', async () => {
      const response = await fetch(`${API_URL}/api/tasks/non-existent-id`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.status).toBe(404)
    })
  })
})

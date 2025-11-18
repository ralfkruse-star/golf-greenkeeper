/**
 * Tasks API Routes
 * POST /api/tasks - Create task
 * GET /api/tasks - List tasks
 */

import { NextRequest } from 'next/server'
import { TaskService } from '@/modules/tasks/services/task-service'
import { createTaskSchema } from '@/modules/tasks/validators'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody, getQueryParams } from '@/lib/api-helpers'
import { TaskStatus, TaskPriority } from '@/modules/tasks/types'

const taskService = new TaskService(prisma)

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request)

    // Validate input
    const validatedData = createTaskSchema.parse(body)

    // TODO: Get userId from JWT token (auth middleware)
    // For now, using a placeholder
    const createdById = request.headers.get('x-user-id') || 'system'

    // Create task
    const task = await taskService.createTask(validatedData, createdById)

    return successResponse(task, 201)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * GET /api/tasks
 * List tasks with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)

    // Parse filters
    const filters: any = {}

    if (params.status) {
      filters.status = params.status as TaskStatus
    }

    if (params.priority) {
      filters.priority = params.priority as TaskPriority
    }

    if (params.assignedToId) {
      filters.assignedToId = params.assignedToId
    }

    if (params.locationId) {
      filters.locationId = params.locationId
    }

    if (params.fromDate) {
      filters.fromDate = new Date(params.fromDate)
    }

    if (params.toDate) {
      filters.toDate = new Date(params.toDate)
    }

    if (params.page) {
      filters.page = parseInt(params.page, 10)
    }

    if (params.pageSize) {
      filters.pageSize = parseInt(params.pageSize, 10)
    }

    const result = await taskService.listTasks(filters)

    return successResponse({
      tasks: result.tasks,
      pagination: {
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        total: result.total,
        totalPages: Math.ceil(result.total / (filters.pageSize || 20)),
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}

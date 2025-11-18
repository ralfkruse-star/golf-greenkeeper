/**
 * Single Task API Routes
 * GET /api/tasks/[id] - Get task by ID
 */

import { NextRequest } from 'next/server'
import { TaskService } from '@/modules/tasks/services/task-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getPathParam } from '@/lib/api-helpers'
import { NotFoundError } from '@/types'

const taskService = new TaskService(prisma)

/**
 * GET /api/tasks/[id]
 * Get a single task by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const taskId = params.id

    const task = await taskService.getTaskById(taskId)

    if (!task) {
      throw new NotFoundError('Task')
    }

    return successResponse(task)
  } catch (error) {
    return errorResponse(error)
  }
}

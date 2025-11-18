/**
 * Task Assignment API Route
 * POST /api/tasks/[id]/assign - Assign task to user
 */

import { NextRequest } from 'next/server'
import { TaskService } from '@/modules/tasks/services/task-service'
import { assignTaskSchema } from '@/modules/tasks/validators'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'

const taskService = new TaskService(prisma)

/**
 * POST /api/tasks/[id]/assign
 * Assign task to a user
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const taskId = params.id

    const body = await getRequestBody(request)

    // Validate input
    const validatedData = assignTaskSchema.parse(body)

    // TODO: Get userId from JWT token
    const assignedById = request.headers.get('x-user-id') || 'system'

    // Assign task
    const task = await taskService.assignTask(taskId, validatedData.assignedToId, assignedById)

    return successResponse(task)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * Task Status API Route
 * PATCH /api/tasks/[id]/status - Update task status
 */

import { NextRequest } from 'next/server'
import { TaskService } from '@/modules/tasks/services/task-service'
import { updateTaskStatusSchema } from '@/modules/tasks/validators'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'

const taskService = new TaskService(prisma)

/**
 * PATCH /api/tasks/[id]/status
 * Update task status
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const taskId = params.id

    const body = await getRequestBody(request)

    // Validate input
    const validatedData = updateTaskStatusSchema.parse(body)

    // TODO: Get userId from JWT token
    const userId = request.headers.get('x-user-id') || 'system'

    // Update status
    const task = await taskService.updateTaskStatus({
      taskId,
      newStatus: validatedData.newStatus,
      userId,
      notes: validatedData.notes,
    })

    return successResponse(task)
  } catch (error) {
    return errorResponse(error)
  }
}

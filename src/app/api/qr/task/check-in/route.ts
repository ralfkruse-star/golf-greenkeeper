/**
 * QR Task Check-In API Route
 * POST /api/qr/task/check-in
 * Start a task using QR code
 */

import { NextRequest } from 'next/server'
import { TaskService } from '@/modules/tasks/services/task-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'
import { NotFoundError, ValidationError } from '@/types'
import { z } from 'zod'

const taskService = new TaskService(prisma)

const taskCheckInSchema = z.object({
  taskCode: z.string().min(1, 'Task code is required'),
})

/**
 * POST /api/qr/task/check-in
 * Start a task using QR code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request)

    // Validate input
    const validatedData = taskCheckInSchema.parse(body)

    // Find task by code
    const task = await prisma.task.findUnique({
      where: { code: validatedData.taskCode },
    })

    if (!task) {
      throw new NotFoundError('Task')
    }

    // TODO: Get userId from JWT token
    const userId = request.headers.get('x-user-id') || 'system'

    // Verify user is assigned to this task (optional check)
    if (task.assignedToId && task.assignedToId !== userId) {
      throw new ValidationError('You are not assigned to this task')
    }

    // Start the task
    const startedTask = await taskService.startTask(task.id, userId)

    return successResponse({
      message: 'Task started successfully',
      task: startedTask,
    })
  } catch (error) {
    return errorResponse(error)
  }
}

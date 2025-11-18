/**
 * Task Logs API Route
 * GET /api/tasks/[id]/logs - Get task logs
 */

import { NextRequest } from 'next/server'
import { TaskService } from '@/modules/tasks/services/task-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

const taskService = new TaskService(prisma)

/**
 * GET /api/tasks/[id]/logs
 * Get all logs for a task
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const taskId = params.id

    const logs = await taskService.getTaskLogs(taskId)

    return successResponse(logs)
  } catch (error) {
    return errorResponse(error)
  }
}

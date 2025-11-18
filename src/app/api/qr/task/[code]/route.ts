/**
 * GET /api/qr/task/:code - Get task by QR code
 */

import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/modules/tasks/application/task.service'
import { TaskRepository } from '@/modules/tasks/infrastructure/task.repository'
import { authenticateRequest } from '@/lib/auth/middleware'

const taskService = new TaskService(new TaskRepository())

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const user = authenticateRequest(req)

    const task = await taskService.getTaskByCode(params.code)

    return NextResponse.json({
      success: true,
      data: {
        task: task.toJSON,
        actions: {
          canStart: task.status === 'TODO' || task.status === 'ON_HOLD',
          canComplete: task.status === 'IN_PROGRESS',
          canHold: task.status === 'IN_PROGRESS',
          isAssignedToMe: task.assignedToId === user.userId,
        },
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'An error occurred',
        },
      },
      { status: error.statusCode || 500 }
    )
  }
}

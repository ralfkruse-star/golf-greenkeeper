/**
 * PATCH /api/tasks/:id/status - Update task status
 */

import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/modules/tasks/application/task.service'
import { TaskRepository } from '@/modules/tasks/infrastructure/task.repository'
import { authenticateRequest } from '@/lib/auth/middleware'
import { updateTaskStatusSchema } from '@/lib/validation'
import { TaskStatus } from '@/types'

const taskService = new TaskService(new TaskRepository())

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(req)

    const body = await req.json()

    // Validate
    const result = updateTaskStatusSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: result.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const { status, notes } = result.data

    let task
    switch (status) {
      case TaskStatus.IN_PROGRESS:
        task = await taskService.startTask(params.id, user.userId)
        break
      case TaskStatus.ON_HOLD:
        task = await taskService.putTaskOnHold(params.id, user.userId, notes)
        break
      case TaskStatus.COMPLETED:
        task = await taskService.completeTask(params.id, user.userId)
        break
      case TaskStatus.CANCELLED:
        task = await taskService.cancelTask(params.id, user.userId, notes)
        break
      default:
        // Resume from ON_HOLD
        task = await taskService.resumeTask(params.id, user.userId)
    }

    return NextResponse.json({
      success: true,
      data: task.toJSON,
    })
  } catch (error: any) {
    console.error('Update task status error:', error)

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

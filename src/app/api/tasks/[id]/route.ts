/**
 * GET /api/tasks/:id - Get task by ID
 * PATCH /api/tasks/:id - Update task
 * DELETE /api/tasks/:id - Delete task
 */

import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/modules/tasks/application/task.service'
import { TaskRepository } from '@/modules/tasks/infrastructure/task.repository'
import { authenticateRequest } from '@/lib/auth/middleware'

const taskService = new TaskService(new TaskRepository())

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(req)

    const task = await taskService.getTaskById(params.id)

    return NextResponse.json({
      success: true,
      data: task.toJSON,
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(req)

    const body = await req.json()

    const task = await taskService.updateTask(params.id, body)

    return NextResponse.json({
      success: true,
      data: task.toJSON,
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(req)

    await taskService.deleteTask(params.id, user.userId)

    return NextResponse.json({
      success: true,
      data: null,
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

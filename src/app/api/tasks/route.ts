/**
 * GET /api/tasks - List tasks
 * POST /api/tasks - Create task
 */

import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/modules/tasks/application/task.service'
import { TaskRepository } from '@/modules/tasks/infrastructure/task.repository'
import { authenticateRequest, requireManagement } from '@/lib/auth/middleware'
import { createTaskSchema } from '@/lib/validation'

const taskService = new TaskService(new TaskRepository())

export async function GET(req: NextRequest) {
  try {
    const user = authenticateRequest(req)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const assignedToId = searchParams.get('assignedToId') || undefined
    const zoneId = searchParams.get('zoneId') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const { tasks, total } = await taskService.listTasks(
      { status: status as any, assignedToId, zoneId },
      page,
      limit
    )

    return NextResponse.json({
      success: true,
      data: {
        tasks: tasks.map(t => t.toJSON),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error: any) {
    console.error('List tasks error:', error)

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

export async function POST(req: NextRequest) {
  try {
    const user = authenticateRequest(req)
    requireManagement(user)

    const body = await req.json()

    // Validate
    const result = createTaskSchema.safeParse(body)
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

    const task = await taskService.createTask({
      ...result.data,
      scheduledStart: result.data.scheduledStart ? new Date(result.data.scheduledStart) : undefined,
      scheduledEnd: result.data.scheduledEnd ? new Date(result.data.scheduledEnd) : undefined,
      createdById: user.userId,
    })

    return NextResponse.json(
      {
        success: true,
        data: task.toJSON,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create task error:', error)

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

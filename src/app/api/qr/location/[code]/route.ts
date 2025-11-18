/**
 * GET /api/qr/location/:code - Get location/zone by QR code and associated tasks
 */

import { NextRequest, NextResponse } from 'next/server'
import { LocationService } from '@/modules/locations/application/location.service'
import { LocationRepository } from '@/modules/locations/infrastructure/location.repository'
import { TaskService } from '@/modules/tasks/application/task.service'
import { TaskRepository } from '@/modules/tasks/infrastructure/task.repository'
import { authenticateRequest } from '@/lib/auth/middleware'
import { TaskStatus } from '@/types'

const locationService = new LocationService(new LocationRepository())
const taskService = new TaskService(new TaskRepository())

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const user = authenticateRequest(req)

    const zone = await locationService.getZoneByCode(params.code)

    // Get tasks for this zone
    const { tasks } = await taskService.listTasks(
      {
        zoneId: zone.id,
        status: TaskStatus.TODO,
      },
      1,
      50
    )

    const assignedTasks = await taskService.getTasksForUser(user.userId)
    const myTasksForZone = assignedTasks.filter(
      t => t.toJSON.zoneId === zone.id && t.status !== TaskStatus.COMPLETED
    )

    return NextResponse.json({
      success: true,
      data: {
        zone: zone.toJSON,
        allTasks: tasks.map(t => t.toJSON),
        myTasks: myTasksForZone.map(t => t.toJSON),
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

/**
 * QR Location Check-In API Route
 * POST /api/qr/location/check-in
 * Check in to a location (for starting location-based tasks)
 */

import { NextRequest } from 'next/server'
import { LocationService } from '@/modules/locations/services/location-service'
import { TaskService } from '@/modules/tasks/services/task-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'
import { NotFoundError } from '@/types'
import { z } from 'zod'

const locationService = new LocationService(prisma)
const taskService = new TaskService(prisma)

const locationCheckInSchema = z.object({
  locationCode: z.string().min(1, 'Location code is required'),
  taskId: z.string().cuid().optional(), // Optional task to start at this location
})

/**
 * POST /api/qr/location/check-in
 * Check in to a location using QR code
 * Optionally start a task at this location
 */
export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request)

    // Validate input
    const validatedData = locationCheckInSchema.parse(body)

    // Find location by code
    const location = await locationService.getLocationByCode(validatedData.locationCode)

    if (!location) {
      throw new NotFoundError('Location')
    }

    // TODO: Get userId from JWT token
    const userId = request.headers.get('x-user-id') || 'system'

    const result: any = {
      message: 'Checked in to location successfully',
      location: {
        id: location.id,
        name: location.name,
        code: location.code,
        type: location.type,
      },
    }

    // If taskId provided, start the task
    if (validatedData.taskId) {
      const task = await taskService.startTask(validatedData.taskId, userId)
      result.task = task
      result.message = 'Task started at location'
    }

    return successResponse(result)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * Single Location API Route
 * GET /api/locations/[id] - Get location by ID
 */

import { NextRequest } from 'next/server'
import { LocationService } from '@/modules/locations/services/location-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { NotFoundError } from '@/types'

const locationService = new LocationService(prisma)

/**
 * GET /api/locations/[id]
 * Get a single location by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const locationId = params.id

    const location = await locationService.getLocationById(locationId)

    if (!location) {
      throw new NotFoundError('Location')
    }

    return successResponse(location)
  } catch (error) {
    return errorResponse(error)
  }
}

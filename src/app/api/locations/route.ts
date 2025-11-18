/**
 * Locations API Routes
 * POST /api/locations - Create location
 * GET /api/locations - List locations
 */

import { NextRequest } from 'next/server'
import { LocationService } from '@/modules/locations/services/location-service'
import { createLocationSchema } from '@/modules/locations/validators'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody, getQueryParams } from '@/lib/api-helpers'
import { LocationType } from '@/modules/locations/types'

const locationService = new LocationService(prisma)

/**
 * POST /api/locations
 * Create a new location
 */
export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request)

    // Validate input
    const validatedData = createLocationSchema.parse(body)

    // Create location
    const location = await locationService.createLocation(validatedData)

    return successResponse(location, 201)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * GET /api/locations
 * List locations with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)

    // Parse filters
    const filters: any = {}

    if (params.type) {
      filters.type = params.type as LocationType
    }

    if (params.parentId) {
      filters.parentId = params.parentId === 'null' ? null : params.parentId
    }

    if (params.active) {
      filters.active = params.active === 'true'
    }

    const locations = await locationService.listLocations(filters)

    return successResponse(locations)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * Location Hierarchy API Route
 * GET /api/locations/hierarchy - Get full course hierarchy
 */

import { NextRequest } from 'next/server'
import { LocationService } from '@/modules/locations/services/location-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

const locationService = new LocationService(prisma)

/**
 * GET /api/locations/hierarchy
 * Get the complete location hierarchy (courses -> holes -> zones)
 */
export async function GET(request: NextRequest) {
  try {
    const hierarchy = await locationService.getLocationHierarchy()

    return successResponse(hierarchy)
  } catch (error) {
    return errorResponse(error)
  }
}

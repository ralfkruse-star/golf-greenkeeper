/**
 * Fleet Status API
 * GET /api/robotics/fleet - Get fleet status overview
 */

import { NextRequest } from 'next/server'
import { RoboticsService } from '@/modules/robotics/services/robotics-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

const roboticsService = new RoboticsService(prisma)

export async function GET(request: NextRequest) {
  try {
    // TODO: Get tenantId from JWT
    const tenantId = request.headers.get('x-tenant-id') || 'default'

    const fleetStatus = await roboticsService.getFleetStatus(tenantId)

    return successResponse(fleetStatus)
  } catch (error) {
    return errorResponse(error)
  }
}

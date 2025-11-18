/**
 * Green Health Analysis API
 * GET /api/vision/health/[locationId] - Get health analysis for location
 */

import { NextRequest } from 'next/server'
import { ComputerVisionService } from '@/modules/vision/services/computer-vision-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

const visionService = new ComputerVisionService(prisma)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locationId: string }> }
) {
  try {
    const params = await context.params
    const locationId = params.locationId

    const health = await visionService.getGreenHealthAnalysis(locationId)

    return successResponse(health)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * Carbon Credits API
 * GET /api/sustainability/carbon-credits
 */

import { NextRequest } from 'next/server'
import { SustainabilityService } from '@/modules/sustainability/services/sustainability-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getQueryParams } from '@/lib/api-helpers'

const sustainabilityService = new SustainabilityService(prisma)

export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)
    const year = params.year ? parseInt(params.year, 10) : new Date().getFullYear()

    const carbonCredits = await sustainabilityService.calculateCarbonCredits(year)

    return successResponse(carbonCredits)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * Sustainability Metrics API
 * GET /api/sustainability/metrics
 */

import { NextRequest } from 'next/server'
import { SustainabilityService } from '@/modules/sustainability/services/sustainability-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getQueryParams } from '@/lib/api-helpers'

const sustainabilityService = new SustainabilityService(prisma)

export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)

    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setFullYear(toDate.getFullYear() - 1) // Last year

    const metrics = await sustainabilityService.calculateMetrics(fromDate, toDate)

    return successResponse(metrics)
  } catch (error) {
    return errorResponse(error)
  }
}

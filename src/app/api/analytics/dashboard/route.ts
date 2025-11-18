/**
 * Analytics Dashboard API
 * GET /api/analytics/dashboard - Get comprehensive KPIs
 */

import { NextRequest } from 'next/server'
import { AnalyticsService } from '@/modules/analytics/services/analytics-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getQueryParams } from '@/lib/api-helpers'

const analyticsService = new AnalyticsService(prisma)

export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)
    const period = (params.period as 'week' | 'month' | 'year') || 'month'

    const kpis = await analyticsService.getDashboardKPIs(period)

    return successResponse(kpis)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * AI Schedule Optimization API
 * GET /api/ai/schedule-optimize
 */

import { NextRequest } from 'next/server'
import { AITaskScheduler } from '@/modules/ai/services/task-scheduler'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getQueryParams } from '@/lib/api-helpers'

const scheduler = new AITaskScheduler(prisma)

export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)
    const days = params.days ? parseInt(params.days, 10) : 7

    const optimization = await scheduler.optimizeSchedule(days)

    return successResponse(optimization)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * Leaderboard API
 * GET /api/gamification/leaderboard - Get leaderboard
 */

import { NextRequest } from 'next/server'
import { GamificationService } from '@/modules/gamification/services/gamification-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getQueryParams } from '@/lib/api-helpers'
import { z } from 'zod'

const gamificationService = new GamificationService(prisma)

const periodSchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME'])

export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)
    const period = periodSchema.parse(params.period || 'WEEKLY')
    const category = params.category

    // TODO: Get tenantId from JWT
    const tenantId = request.headers.get('x-tenant-id') || 'default'

    const leaderboard = await gamificationService.getLeaderboard(period, category, tenantId)

    return successResponse(leaderboard)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * Challenges API
 * GET /api/gamification/challenges - Get active challenges
 */

import { NextRequest } from 'next/server'
import { GamificationService } from '@/modules/gamification/services/gamification-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

const gamificationService = new GamificationService(prisma)

export async function GET(request: NextRequest) {
  try {
    // TODO: Get tenantId from JWT
    const tenantId = request.headers.get('x-tenant-id') || 'default'

    const challenges = await gamificationService.getActiveChallenges(tenantId)

    return successResponse({ challenges })
  } catch (error) {
    return errorResponse(error)
  }
}

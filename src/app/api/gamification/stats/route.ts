/**
 * Gamification Stats API
 * GET /api/gamification/stats - Get user's gamification statistics
 */

import { NextRequest } from 'next/server'
import { GamificationService } from '@/modules/gamification/services/gamification-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

const gamificationService = new GamificationService(prisma)

export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from JWT
    const userId = request.headers.get('x-user-id') || 'system'

    const stats = await gamificationService.getUserGamificationStats(userId)

    return successResponse(stats)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * User Achievements API
 * GET /api/gamification/achievements/user - Get user's achievements
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

    const achievements = await gamificationService.getUserAchievements(userId)
    return successResponse({ achievements })
  } catch (error) {
    return errorResponse(error)
  }
}

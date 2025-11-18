/**
 * Achievements API
 * GET /api/gamification/achievements - Get all achievements
 */

import { NextRequest } from 'next/server'
import { GamificationService } from '@/modules/gamification/services/gamification-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

const gamificationService = new GamificationService(prisma)

export async function GET(request: NextRequest) {
  try {
    const achievements = await gamificationService.getAllAchievements()
    return successResponse({ achievements })
  } catch (error) {
    return errorResponse(error)
  }
}

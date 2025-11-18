/**
 * Start Mission API
 * POST /api/robotics/missions/[missionId]/start - Start a mission
 */

import { NextRequest } from 'next/server'
import { RoboticsService } from '@/modules/robotics/services/robotics-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

const roboticsService = new RoboticsService(prisma)

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ missionId: string }> }
) {
  try {
    const params = await context.params
    const missionId = params.missionId

    const mission = await roboticsService.startMission(missionId)

    return successResponse(mission)
  } catch (error) {
    return errorResponse(error)
  }
}

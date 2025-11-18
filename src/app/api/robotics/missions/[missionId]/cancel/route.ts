/**
 * Cancel Mission API
 * POST /api/robotics/missions/[missionId]/cancel - Cancel a mission
 */

import { NextRequest } from 'next/server'
import { RoboticsService } from '@/modules/robotics/services/robotics-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'
import { z } from 'zod'

const roboticsService = new RoboticsService(prisma)

const cancelSchema = z.object({
  reason: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ missionId: string }> }
) {
  try {
    const params = await context.params
    const missionId = params.missionId

    const body = await getRequestBody(request)
    const validated = cancelSchema.parse(body)

    const mission = await roboticsService.cancelMission(missionId, validated.reason)

    return successResponse(mission)
  } catch (error) {
    return errorResponse(error)
  }
}

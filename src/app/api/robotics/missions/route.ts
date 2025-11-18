/**
 * Robot Missions API
 * GET /api/robotics/missions - Get missions
 * POST /api/robotics/missions - Create new mission
 */

import { NextRequest } from 'next/server'
import { RoboticsService } from '@/modules/robotics/services/robotics-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'
import { z } from 'zod'

const roboticsService = new RoboticsService(prisma)

const missionPlanSchema = z.object({
  locationId: z.string(),
  type: z.enum(['MOWING', 'TRIMMING', 'LINE_MARKING', 'SPRAYING', 'PATROL']),
  scheduledStart: z.string().transform((s) => new Date(s)),
  estimatedDuration: z.number().min(1),
  parameters: z.object({
    cuttingHeight: z.number().optional(),
    speed: z.number().optional(),
    pattern: z.enum(['STRIPE', 'CHECKERBOARD', 'RANDOM', 'PERIMETER_FIRST']).optional(),
    applicationRate: z.number().optional(),
  }),
})

export async function GET(request: NextRequest) {
  try {
    // TODO: Get tenantId from JWT
    const tenantId = request.headers.get('x-tenant-id') || 'default'

    const missions = await roboticsService.getActiveMissions(tenantId)

    return successResponse({ missions })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request)
    const validated = missionPlanSchema.parse(body)

    // TODO: Get userId from JWT
    const userId = request.headers.get('x-user-id') || 'system'

    const mission = await roboticsService.createMission(validated, userId)

    return successResponse(mission, 201)
  } catch (error) {
    return errorResponse(error)
  }
}

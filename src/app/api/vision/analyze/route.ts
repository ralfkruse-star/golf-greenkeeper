/**
 * Image Analysis API
 * POST /api/vision/analyze - Analyze image for turf quality and diseases
 */

import { NextRequest } from 'next/server'
import { ComputerVisionService } from '@/modules/vision/services/computer-vision-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'
import { z } from 'zod'

const visionService = new ComputerVisionService(prisma)

const analyzeSchema = z.object({
  imageUrl: z.string().url(),
  locationId: z.string().cuid().optional(),
  analysisType: z.enum(['TURF_QUALITY', 'DISEASE_DETECTION', 'STRESS_ANALYSIS', 'WEED_DETECTION', 'OVERALL_CONDITION']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request)
    const validated = analyzeSchema.parse(body)

    // TODO: Get userId from JWT
    const userId = request.headers.get('x-user-id') || 'system'

    const analysis = await visionService.analyzeImage(
      validated.imageUrl,
      validated.locationId,
      validated.analysisType || 'OVERALL_CONDITION',
      userId
    )

    return successResponse(analysis, 201)
  } catch (error) {
    return errorResponse(error)
  }
}

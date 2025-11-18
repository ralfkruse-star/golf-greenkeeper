/**
 * AI Assistant Chat API
 * POST /api/ai/chat - Send message to AI assistant
 */

import { NextRequest } from 'next/server'
import { AIAssistantService } from '@/modules/ai/services/assistant-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'
import { z } from 'zod'

const assistantService = new AIAssistantService(prisma)

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().optional(),
  context: z
    .object({
      locationId: z.string().optional(),
      taskId: z.string().optional(),
      equipmentId: z.string().optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request)
    const validated = chatSchema.parse(body)

    // TODO: Get userId and tenantId from JWT
    const userId = request.headers.get('x-user-id') || 'system'
    const tenantId = request.headers.get('x-tenant-id') || 'default'

    const response = await assistantService.chat(validated, userId, tenantId)

    return successResponse(response, 200)
  } catch (error) {
    return errorResponse(error)
  }
}

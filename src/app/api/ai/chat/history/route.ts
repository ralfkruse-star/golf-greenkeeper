/**
 * AI Assistant Chat History API
 * GET /api/ai/chat/history - Get user's chat history
 */

import { NextRequest } from 'next/server'
import { AIAssistantService } from '@/modules/ai/services/assistant-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getQueryParams } from '@/lib/api-helpers'

const assistantService = new AIAssistantService(prisma)

export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)
    const limit = params.limit ? parseInt(params.limit, 10) : 10

    // TODO: Get userId from JWT
    const userId = request.headers.get('x-user-id') || 'system'

    const history = await assistantService.getChatHistory(userId, limit)

    return successResponse({ sessions: history })
  } catch (error) {
    return errorResponse(error)
  }
}

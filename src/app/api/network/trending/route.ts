/**
 * Trending Topics API
 * GET /api/network/trending - Get trending topics
 */

import { NextRequest } from 'next/server'
import { NetworkService } from '@/modules/network/services/network-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

const networkService = new NetworkService(prisma)

export async function GET(request: NextRequest) {
  try {
    const trending = await networkService.getTrendingTopics()
    return successResponse({ topics: trending })
  } catch (error) {
    return errorResponse(error)
  }
}

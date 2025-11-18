/**
 * Knowledge Posts API
 * GET /api/network/posts - Search/list posts
 * POST /api/network/posts - Create new post
 */

import { NextRequest } from 'next/server'
import { NetworkService } from '@/modules/network/services/network-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody, getQueryParams } from '@/lib/api-helpers'
import { z } from 'zod'

const networkService = new NetworkService(prisma)

const createPostSchema = z.object({
  type: z.enum(['QUESTION', 'DISCUSSION', 'SHOWCASE', 'TIP', 'PROBLEM']),
  category: z.enum([
    'TURF_MANAGEMENT',
    'DISEASE_PEST',
    'EQUIPMENT',
    'SUSTAINABILITY',
    'WEATHER',
    'REGULATIONS',
    'BEST_PRACTICES',
    'CAREER',
    'GENERAL',
  ]),
  title: z.string().min(10).max(200),
  content: z.string().min(20).max(10000),
  tags: z.array(z.string()).min(1).max(10),
  photoUrls: z.array(z.string()).optional(),
  climateZone: z.string().optional(),
  grassType: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)

    const searchRequest = {
      query: params.query,
      category: params.category,
      type: params.type,
      tags: params.tags ? params.tags.split(',') : undefined,
      sortBy: params.sortBy as 'recent' | 'popular' | 'unanswered' | undefined,
      limit: params.limit ? parseInt(params.limit, 10) : 20,
      offset: params.offset ? parseInt(params.offset, 10) : 0,
    }

    const result = await networkService.searchPosts(searchRequest)

    return successResponse(result)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request)
    const validated = createPostSchema.parse(body)

    // TODO: Get userId and userName from JWT
    const userId = request.headers.get('x-user-id') || 'system'
    const userName = 'John Doe' // Get from user profile

    const post = await networkService.createPost(validated, userId, userName)

    return successResponse(post, 201)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * Like Post API
 * POST /api/network/posts/[postId]/like - Like a post
 */

import { NextRequest } from 'next/server'
import { NetworkService } from '@/modules/network/services/network-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

const networkService = new NetworkService(prisma)

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const params = await context.params
    const postId = params.postId

    // TODO: Get userId from JWT
    const userId = request.headers.get('x-user-id') || 'system'

    await networkService.likePost(postId, userId)

    return successResponse({ message: 'Post liked successfully' })
  } catch (error) {
    return errorResponse(error)
  }
}

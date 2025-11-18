/**
 * Single Post API
 * GET /api/network/posts/[postId] - Get post details
 */

import { NextRequest } from 'next/server'
import { NetworkService } from '@/modules/network/services/network-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

const networkService = new NetworkService(prisma)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const params = await context.params
    const postId = params.postId

    const post = await networkService.getPostById(postId)

    if (!post) {
      return errorResponse(new Error('Post not found'), 404)
    }

    const comments = await networkService.getComments(postId)

    return successResponse({ post, comments })
  } catch (error) {
    return errorResponse(error)
  }
}

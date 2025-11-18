/**
 * Post Comments API
 * POST /api/network/posts/[postId]/comments - Add comment to post
 */

import { NextRequest } from 'next/server'
import { NetworkService } from '@/modules/network/services/network-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'
import { z } from 'zod'

const networkService = new NetworkService(prisma)

const createCommentSchema = z.object({
  content: z.string().min(10).max(5000),
  parentCommentId: z.string().optional(),
  photoUrls: z.array(z.string()).optional(),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const params = await context.params
    const postId = params.postId

    const body = await getRequestBody(request)
    const validated = createCommentSchema.parse(body)

    // TODO: Get userId and userName from JWT
    const userId = request.headers.get('x-user-id') || 'system'
    const userName = 'John Doe'

    const comment = await networkService.createComment(
      {
        postId,
        ...validated,
      },
      userId,
      userName
    )

    return successResponse(comment, 201)
  } catch (error) {
    return errorResponse(error)
  }
}

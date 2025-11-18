/**
 * Current User API Route
 * GET /api/auth/me
 */

import { NextRequest } from 'next/server'
import { AuthService } from '@/modules/auth/services/auth-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { withAuth, type AuthenticatedRequest, getCurrentUser } from '@/lib/auth/middleware'

const authService = new AuthService(prisma)

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const currentUser = getCurrentUser(req)

    const user = await authService.getUserById(currentUser.userId)

    if (!user) {
      return errorResponse(new Error('User not found'), 404)
    }

    return successResponse(user)
  } catch (error) {
    return errorResponse(error)
  }
})

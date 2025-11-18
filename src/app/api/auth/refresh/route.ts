/**
 * Refresh Token API Route
 * POST /api/auth/refresh
 */

import { NextRequest } from 'next/server'
import { AuthService } from '@/modules/auth/services/auth-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { UnauthorizedError } from '@/types'

const authService = new AuthService(prisma)

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or body
    const refreshToken =
      request.cookies.get('refreshToken')?.value ||
      (await request.json().catch(() => ({})))?.refreshToken

    if (!refreshToken) {
      throw new UnauthorizedError('No refresh token provided')
    }

    // Refresh token
    const result = await authService.refreshToken({ refreshToken })

    return successResponse(result)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * Login API Route
 * POST /api/auth/login
 */

import { NextRequest } from 'next/server'
import { AuthService } from '@/modules/auth/services/auth-service'
import { loginSchema } from '@/modules/auth/validators'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'

const authService = new AuthService(prisma)

/**
 * POST /api/auth/login
 * Authenticate user and return tokens
 */
export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request)

    // Validate input
    const validatedData = loginSchema.parse(body)

    // Login
    const result = await authService.login(validatedData)

    // Set refresh token as httpOnly cookie
    const response = successResponse(result)

    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    return errorResponse(error)
  }
}

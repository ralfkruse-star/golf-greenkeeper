/**
 * Logout API Route
 * POST /api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server'
import { successResponse } from '@/lib/api-helpers'

/**
 * POST /api/auth/logout
 * Clear refresh token cookie
 */
export async function POST(request: NextRequest) {
  const response = successResponse({ message: 'Logged out successfully' })

  // Clear refresh token cookie
  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })

  return response
}

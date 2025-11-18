/**
 * POST /api/auth/refresh
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/modules/auth/application/auth.service'
import { UserRepository } from '@/modules/auth/infrastructure/user.repository'

const authService = new AuthService(new UserRepository())

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refresh token is required',
          },
        },
        { status: 400 }
      )
    }

    const tokens = await authService.refresh(refreshToken)

    return NextResponse.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    })
  } catch (error: any) {
    console.error('Refresh error:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'An error occurred',
        },
      },
      { status: error.statusCode || 500 }
    )
  }
}

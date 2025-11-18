/**
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/modules/auth/application/auth.service'
import { UserRepository } from '@/modules/auth/infrastructure/user.repository'
import { loginSchema } from '@/lib/validation'
import { ValidationError } from '@/lib/errors'

const authService = new AuthService(new UserRepository())

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: result.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const { user, tokens } = await authService.login(result.data)

    return NextResponse.json({
      success: true,
      data: {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    })
  } catch (error: any) {
    console.error('Login error:', error)

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

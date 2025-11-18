/**
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/modules/auth/application/auth.service'
import { UserRepository } from '@/modules/auth/infrastructure/user.repository'
import { createUserSchema } from '@/lib/validation'

const authService = new AuthService(new UserRepository())

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate
    const result = createUserSchema.safeParse(body)
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

    const { user, tokens } = await authService.register(result.data)

    return NextResponse.json({
      success: true,
      data: {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('Register error:', error)

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

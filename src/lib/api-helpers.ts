/**
 * API Helper Functions
 * Common utilities for API routes
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { AppError, ValidationError } from '@/types'

/**
 * Standard API Response formatter
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}

/**
 * Standard API Error Response formatter
 */
export function errorResponse(error: unknown, defaultStatus: number = 500) {
  console.error('API Error:', error)

  // Handle known AppErrors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors,
        },
      },
      { status: 400 }
    )
  }

  // Handle generic errors
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    },
    { status: defaultStatus }
  )
}

/**
 * Extract JSON body from request with error handling
 */
export async function getRequestBody<T = any>(request: Request): Promise<T> {
  try {
    return await request.json()
  } catch {
    throw new ValidationError('Invalid JSON body')
  }
}

/**
 * Parse query parameters from URL
 */
export function getQueryParams(request: Request) {
  const { searchParams } = new URL(request.url)
  return Object.fromEntries(searchParams.entries())
}

/**
 * Extract path parameter from dynamic route
 * Usage: getPathParam(request, 'id') for /api/tasks/[id]
 */
export function getPathParam(context: any, param: string): string {
  const value = context.params?.[param]
  if (!value) {
    throw new ValidationError(`Missing path parameter: ${param}`)
  }
  return value
}

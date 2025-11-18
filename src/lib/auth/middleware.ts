/**
 * Auth Middleware
 * Request authentication and authorization
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromHeader } from './jwt'
import { UnauthorizedError, ForbiddenError } from '@/types'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    role: string
  }
}

/**
 * Middleware to verify JWT token
 */
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.get('authorization')
      const token = extractTokenFromHeader(authHeader)

      if (!token) {
        throw new UnauthorizedError('No token provided')
      }

      // Verify token
      const payload = verifyAccessToken(token)

      // Attach user to request (using headers as Next.js doesn't allow request mutation)
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      }

      // Call the actual handler
      return await handler(authenticatedReq)
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          },
          { status: error.statusCode }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication failed',
          },
        },
        { status: 401 }
      )
    }
  }
}

/**
 * Middleware to check user roles
 */
export function requireRole(allowedRoles: string[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      const userRole = req.user?.role

      if (!userRole || !allowedRoles.includes(userRole)) {
        throw new ForbiddenError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        )
      }

      return await handler(req)
    })
  }
}

/**
 * Get current user from request
 * Only works in authenticated routes
 */
export function getCurrentUser(req: AuthenticatedRequest) {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated')
  }
  return req.user
}

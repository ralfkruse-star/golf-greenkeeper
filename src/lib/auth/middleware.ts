/**
 * Authentication middleware for API routes
 */

import { NextRequest } from 'next/server'
import { verifyAccessToken, TokenPayload } from './jwt'
import { AuthenticationError, AuthorizationError } from '@/lib/errors'
import { UserRole } from '@/types'

/**
 * Extract and verify JWT from Authorization header
 */
export const authenticateRequest = (req: NextRequest): TokenPayload => {
  const authHeader = req.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header')
  }

  const token = authHeader.substring(7)

  try {
    return verifyAccessToken(token)
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token')
  }
}

/**
 * Check if user has required role(s)
 */
export const requireRole = (
  user: TokenPayload,
  allowedRoles: UserRole[]
): void => {
  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError(
      `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`
    )
  }
}

/**
 * Check if user is admin or manager
 */
export const requireManagement = (user: TokenPayload): void => {
  requireRole(user, [UserRole.ADMIN, UserRole.MANAGER, UserRole.HEAD_GREENKEEPER])
}

/**
 * Check if user is admin
 */
export const requireAdmin = (user: TokenPayload): void => {
  requireRole(user, [UserRole.ADMIN])
}

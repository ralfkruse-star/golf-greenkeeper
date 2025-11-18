/**
 * JWT Utilities
 * Token generation and verification
 */

import jwt from 'jsonwebtoken'
import { config } from '@/lib/config'

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  })
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  })
}

/**
 * Generate both tokens
 */
export function generateTokenPair(payload: JwtPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  }
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.jwt.accessSecret) as JwtPayload
  } catch (error) {
    throw new Error('Invalid or expired access token')
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload
  } catch (error) {
    throw new Error('Invalid or expired refresh token')
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1]
}

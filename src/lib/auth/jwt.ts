/**
 * JWT utilities for authentication
 */

import jwt from 'jsonwebtoken'
import { UserRole } from '@/types'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-change-me'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me'
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m'
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d'

export interface TokenPayload {
  userId: string
  email: string
  role: UserRole
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

/**
 * Generate access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload as object, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY,
  } as any)
}

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload as object, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
  } as any)
}

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (payload: TokenPayload): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  }
}

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload
  } catch (error) {
    throw new Error('Invalid or expired access token')
  }
}

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload
  } catch (error) {
    throw new Error('Invalid or expired refresh token')
  }
}

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload
  } catch {
    return null
  }
}

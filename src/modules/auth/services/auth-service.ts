/**
 * Auth Service
 * Business logic for authentication
 */

import { hashPassword, verifyPassword, validatePasswordStrength } from '@/lib/auth/password'
import { generateTokenPair, verifyRefreshToken, type JwtPayload } from '@/lib/auth/jwt'
import { UnauthorizedError, ValidationError } from '@/types'
import type { LoginInput, LoginResponse, RefreshTokenInput, RegisterInput } from '../types'

export class AuthService {
  constructor(private prisma: any) {}

  /**
   * Login user
   */
  async login(input: LoginInput): Promise<LoginResponse> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    })

    if (!user) {
      throw new UnauthorizedError('Invalid credentials')
    }

    if (!user.active) {
      throw new UnauthorizedError('Account is deactivated')
    }

    // Verify password
    const isValid = await verifyPassword(user.password, input.password)

    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials')
    }

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const tokens = generateTokenPair(payload)

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(input: RefreshTokenInput): Promise<{ accessToken: string }> {
    // Verify refresh token
    let payload: JwtPayload
    try {
      payload = verifyRefreshToken(input.refreshToken)
    } catch {
      throw new UnauthorizedError('Invalid refresh token')
    }

    // Verify user still exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user || !user.active) {
      throw new UnauthorizedError('User not found or inactive')
    }

    // Generate new tokens
    const newPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const tokens = generateTokenPair(newPayload)

    return {
      accessToken: tokens.accessToken,
    }
  }

  /**
   * Register new user (admin only in production)
   */
  async register(input: RegisterInput): Promise<LoginResponse> {
    // Check if email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    })

    if (existing) {
      throw new ValidationError('Email already registered')
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(input.password)
    if (!passwordValidation.valid) {
      throw new ValidationError('Password too weak', passwordValidation.errors)
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password)

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        role: 'GREENKEEPER', // Default role
      },
    })

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const tokens = generateTokenPair(payload)

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true,
        createdAt: true,
      },
    })
  }
}

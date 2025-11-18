/**
 * Auth Service
 */

import { UserRepository } from '../infrastructure/user.repository'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { generateTokenPair, verifyRefreshToken, TokenPair } from '@/lib/auth/jwt'
import { AuthenticationError, ValidationError } from '@/lib/errors'
import { UserRole } from '@/types'

export interface RegisterDTO {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: UserRole
}

export interface LoginDTO {
  email: string
  password: string
}

export interface UserDTO {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  active: boolean
}

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(dto: RegisterDTO): Promise<{ user: UserDTO; tokens: TokenPair }> {
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(dto.email)
    if (existingUser) {
      throw new ValidationError('Email already registered')
    }

    // Hash password
    const hashedPassword = await hashPassword(dto.password)

    // Create user
    const user = await this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role || UserRole.GREENKEEPER,
    })

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      user: this.toDTO(user),
      tokens,
    }
  }

  async login(dto: LoginDTO): Promise<{ user: UserDTO; tokens: TokenPair }> {
    // Find user
    const user = await this.userRepository.findByEmail(dto.email)
    if (!user) {
      throw new AuthenticationError('Invalid credentials')
    }

    // Check if active
    if (!user.active) {
      throw new AuthenticationError('Account is inactive')
    }

    // Verify password
    const isValid = await verifyPassword(user.password, dto.password)
    if (!isValid) {
      throw new AuthenticationError('Invalid credentials')
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      user: this.toDTO(user),
      tokens,
    }
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken)

      // Check if user still exists and is active
      const user = await this.userRepository.findById(payload.userId)
      if (!user || !user.active) {
        throw new AuthenticationError('Invalid token')
      }

      // Generate new tokens
      return generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      })
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token')
    }
  }

  async getUserById(id: string): Promise<UserDTO | null> {
    const user = await this.userRepository.findById(id)
    return user ? this.toDTO(user) : null
  }

  private toDTO(user: any): UserDTO {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      active: user.active,
    }
  }
}

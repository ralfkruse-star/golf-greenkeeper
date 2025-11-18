/**
 * Auth Module Types
 */

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenInput {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

export interface RegisterInput {
  email: string
  password: string
  firstName: string
  lastName: string
}

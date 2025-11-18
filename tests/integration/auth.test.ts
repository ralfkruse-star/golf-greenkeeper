/**
 * Integration Tests: Authentication API
 *
 * Tests the /api/auth endpoints with real HTTP requests
 */

import { describe, it, expect, beforeAll } from 'vitest'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

describe('Authentication API Integration', () => {
  let accessToken: string
  let refreshToken: string

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@golfclub.de',
          password: 'admin123',
        }),
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('accessToken')
      expect(data.data).toHaveProperty('refreshToken')
      expect(data.data).toHaveProperty('user')
      expect(data.data.user.email).toBe('admin@golfclub.de')

      // Store tokens for other tests
      accessToken = data.data.accessToken
      refreshToken = data.data.refreshToken
    })

    it('should reject invalid credentials', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@golfclub.de',
          password: 'wrongpassword',
        }),
      })

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toHaveProperty('code')
    })

    it('should reject missing email', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: 'admin123',
        }),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
    })

    it('should reject missing password', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@golfclub.de',
        }),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
    })

    it('should reject invalid email format', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'not-an-email',
          password: 'admin123',
        }),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
    })
  })

  describe('POST /api/auth/refresh', () => {
    beforeAll(async () => {
      // Login to get tokens
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@golfclub.de',
          password: 'admin123',
        }),
      })
      const data = await response.json()
      refreshToken = data.data.refreshToken
    })

    it('should refresh access token with valid refresh token', async () => {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken,
        }),
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('accessToken')
      expect(typeof data.data.accessToken).toBe('string')
    })

    it('should reject invalid refresh token', async () => {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: 'invalid-token',
        }),
      })

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.success).toBe(false)
    })

    it('should reject missing refresh token', async () => {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
    })
  })

  describe('GET /api/auth/me', () => {
    beforeAll(async () => {
      // Login to get fresh token
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@golfclub.de',
          password: 'admin123',
        }),
      })
      const data = await response.json()
      accessToken = data.data.accessToken
    })

    it('should get current user with valid token', async () => {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('user')
      expect(data.data.user.email).toBe('admin@golfclub.de')
      expect(data.data.user).not.toHaveProperty('password')
    })

    it('should reject request without token', async () => {
      const response = await fetch(`${API_URL}/api/auth/me`)

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.success).toBe(false)
    })

    it('should reject request with invalid token', async () => {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      })

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.success).toBe(false)
    })
  })
})

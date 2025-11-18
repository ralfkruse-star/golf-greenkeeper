/**
 * Example Test
 * Verifies test setup is working
 */

import { describe, it, expect } from 'vitest'

describe('Test Setup', () => {
  it('should run basic tests', () => {
    expect(true).toBe(true)
  })

  it('should have access to environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test')
    expect(process.env.JWT_ACCESS_SECRET).toBeDefined()
  })

  it('should perform arithmetic operations', () => {
    const sum = 2 + 2
    expect(sum).toBe(4)
  })
})

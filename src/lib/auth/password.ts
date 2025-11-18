/**
 * Password hashing utilities using Argon2
 */

import argon2 from 'argon2'

/**
 * Hash a password using Argon2
 */
export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  })
}

/**
 * Verify a password against a hash
 */
export const verifyPassword = async (
  hash: string,
  password: string
): Promise<boolean> => {
  try {
    return await argon2.verify(hash, password)
  } catch {
    return false
  }
}

/**
 * Check if a password needs rehashing (e.g., if params changed)
 */
export const needsRehash = async (hash: string): Promise<boolean> => {
  return argon2.needsRehash(hash, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  })
}

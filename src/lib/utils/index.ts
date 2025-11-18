/**
 * Shared utility functions
 */

/**
 * Sleep for a specified duration
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms))

/**
 * Format date to ISO string
 */
export const formatDate = (date: Date): string =>
  date.toISOString()

/**
 * Parse ISO string to Date
 */
export const parseDate = (dateString: string): Date =>
  new Date(dateString)

/**
 * Omit keys from object
 */
export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

/**
 * Pick keys from object
 */
export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * Generate a random alphanumeric string
 */
export const randomString = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate a code with prefix (e.g., "TASK-001", "EQ-042")
 */
export const generateCode = (prefix: string, id: number, length: number = 3): string => {
  return `${prefix}-${String(id).padStart(length, '0')}`
}

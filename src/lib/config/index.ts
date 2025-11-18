/**
 * Application Configuration
 * Centralized config with validation
 */

export const config = {
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  database: {
    url: process.env.DATABASE_URL!,
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  app: {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },

  externalApis: {
    openWeather: {
      apiKey: process.env.OPENWEATHER_API_KEY,
    },
  },
} as const

// Validate critical configs
if (!config.isTest) {
  if (!config.jwt.accessSecret || config.jwt.accessSecret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be at least 32 characters')
  }
  if (!config.jwt.refreshSecret || config.jwt.refreshSecret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters')
  }
}

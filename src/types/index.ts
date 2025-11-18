/**
 * Shared TypeScript types and interfaces
 */

// User roles
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  HEAD_GREENKEEPER = 'HEAD_GREENKEEPER',
  GREENKEEPER = 'GREENKEEPER',
}

// Task status
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Task priority
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// Location/Zone types
export enum ZoneType {
  GREEN = 'GREEN',
  FAIRWAY = 'FAIRWAY',
  TEE = 'TEE',
  BUNKER = 'BUNKER',
  ROUGH = 'ROUGH',
  SEMI_ROUGH = 'SEMI_ROUGH',
  WATER_HAZARD = 'WATER_HAZARD',
  OUT_OF_BOUNDS = 'OUT_OF_BOUNDS',
  PRACTICE_AREA = 'PRACTICE_AREA',
  OTHER = 'OTHER',
}

// Equipment status
export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

// Equipment type
export enum EquipmentType {
  MOWER = 'MOWER',
  TRACTOR = 'TRACTOR',
  VEHICLE = 'VEHICLE',
  SPRAYER = 'SPRAYER',
  AERATOR = 'AERATOR',
  SEEDER = 'SEEDER',
  TOOL = 'TOOL',
  OTHER = 'OTHER',
}

// Material type
export enum MaterialType {
  FERTILIZER = 'FERTILIZER',
  PESTICIDE = 'PESTICIDE',
  HERBICIDE = 'HERBICIDE',
  FUNGICIDE = 'FUNGICIDE',
  SEED = 'SEED',
  SAND = 'SAND',
  SOIL = 'SOIL',
  OTHER = 'OTHER',
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Coordinates
export interface Coordinates {
  latitude: number
  longitude: number
}

// Domain Event
export interface DomainEvent {
  type: string
  aggregateId: string
  occurredAt: Date
  data: unknown
}

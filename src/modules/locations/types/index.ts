/**
 * Location Module Types
 */

export enum LocationType {
  COURSE = 'COURSE',
  HOLE = 'HOLE',
  GREEN = 'GREEN',
  FAIRWAY = 'FAIRWAY',
  TEE = 'TEE',
  BUNKER = 'BUNKER',
  ROUGH = 'ROUGH',
  PRACTICE_AREA = 'PRACTICE_AREA',
  OTHER = 'OTHER',
}

export interface Location {
  id: string
  name: string
  code: string
  type: LocationType
  description?: string
  parentId?: string
  latitude?: number
  longitude?: number
  area?: number
  metadata?: Record<string, any>
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateLocationInput {
  name: string
  code: string
  type: LocationType
  description?: string
  parentId?: string
  latitude?: number
  longitude?: number
  area?: number
  metadata?: Record<string, any>
}

/**
 * Location Service
 * Business logic for location management
 */

import { LocationType, type Location, type CreateLocationInput } from '../types'
import { ValidationError, NotFoundError } from '@/types'

export class LocationService {
  constructor(private prisma: any) {}

  /**
   * Create a new location
   */
  async createLocation(input: CreateLocationInput): Promise<Location> {
    // Check if code is unique
    const existing = await this.prisma.location.findUnique({
      where: { code: input.code },
    })

    if (existing) {
      throw new ValidationError(`Location code ${input.code} already exists`)
    }

    // If parentId provided, verify it exists
    if (input.parentId) {
      const parent = await this.prisma.location.findUnique({
        where: { id: input.parentId },
      })

      if (!parent) {
        throw new NotFoundError('Parent location')
      }
    }

    const location = await this.prisma.location.create({
      data: {
        name: input.name,
        code: input.code,
        type: input.type,
        description: input.description,
        parentId: input.parentId,
        latitude: input.latitude,
        longitude: input.longitude,
        area: input.area,
        metadata: input.metadata ? JSON.parse(JSON.stringify(input.metadata)) : undefined,
      },
    })

    return location
  }

  /**
   * Get location by ID
   */
  async getLocationById(locationId: string): Promise<Location | null> {
    return this.prisma.location.findUnique({
      where: { id: locationId },
      include: {
        parent: true,
        children: true,
      },
    })
  }

  /**
   * Get location by code
   */
  async getLocationByCode(code: string): Promise<Location | null> {
    return this.prisma.location.findUnique({
      where: { code },
      include: {
        parent: true,
        children: true,
      },
    })
  }

  /**
   * List locations with filters
   */
  async listLocations(filters: {
    type?: LocationType
    parentId?: string
    active?: boolean
  }): Promise<Location[]> {
    const where: any = {}

    if (filters.type) where.type = filters.type
    if (filters.parentId !== undefined) where.parentId = filters.parentId
    if (filters.active !== undefined) where.active = filters.active

    return this.prisma.location.findMany({
      where,
      include: {
        parent: true,
        children: true,
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    })
  }

  /**
   * Get location hierarchy (course -> holes -> zones)
   */
  async getLocationHierarchy(): Promise<Location[]> {
    // Get all COURSE locations with their full hierarchy
    const courses = await this.prisma.location.findMany({
      where: { type: LocationType.COURSE },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return courses
  }
}

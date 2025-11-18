/**
 * Robotics Types
 * Autonomous mower and robot fleet management
 */

export enum RobotType {
  AUTONOMOUS_MOWER = 'AUTONOMOUS_MOWER',
  TRIMMER = 'TRIMMER',
  LINE_MARKER = 'LINE_MARKER',
  SPRAYER = 'SPRAYER',
  TRANSPORT = 'TRANSPORT',
}

export enum RobotStatus {
  IDLE = 'IDLE',
  ACTIVE = 'ACTIVE',
  CHARGING = 'CHARGING',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR',
  OFFLINE = 'OFFLINE',
}

export enum MissionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum MissionType {
  MOWING = 'MOWING',
  TRIMMING = 'TRIMMING',
  LINE_MARKING = 'LINE_MARKING',
  SPRAYING = 'SPRAYING',
  PATROL = 'PATROL',
}

export interface RobotDevice {
  id: string
  name: string
  code: string // Device identifier
  type: RobotType
  manufacturer: string
  model: string
  serialNumber: string
  status: RobotStatus

  // Battery & Power
  batteryLevel: number // 0-100
  chargingStationId?: string

  // Location & Position
  currentLocation?: {
    latitude: number
    longitude: number
    locationId?: string
  }

  // Operational
  currentMissionId?: string
  operatingHours: number
  lastMaintenanceAt?: Date
  nextMaintenanceAt?: Date

  // Capabilities
  capabilities: {
    maxSpeed: number // m/s
    cuttingWidth?: number // cm
    tankCapacity?: number // liters
    maxSlope: number // degrees
    gpsEnabled: boolean
    obstacleDetection: boolean
    weatherProof: boolean
  }

  // Status
  active: boolean
  lastSeenAt: Date
  firmware: string

  // Metadata
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface RobotMission {
  id: string
  robotId: string
  robot?: RobotDevice
  type: MissionType
  status: MissionStatus

  // Target Area
  locationId: string
  boundaryPath?: Array<{ latitude: number; longitude: number }>
  area: number // m²

  // Planning
  scheduledStart: Date
  scheduledEnd: Date
  actualStart?: Date
  actualEnd?: Date

  // Progress
  progress: number // 0-100
  distanceCovered: number // meters

  // Parameters
  parameters: {
    cuttingHeight?: number // mm
    speed?: number // m/s
    pattern?: 'STRIPE' | 'CHECKERBOARD' | 'RANDOM' | 'PERIMETER_FIRST'
    applicationRate?: number // for spraying
  }

  // Results
  results?: {
    areaCompleted: number // m²
    timeElapsed: number // minutes
    batteryUsed: number // %
    issues?: string[]
    photoUrls?: string[]
  }

  // Safety & Weather
  weatherConditions?: {
    temperature: number
    precipitation: number
    windSpeed: number
  }

  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface FleetStatus {
  totalRobots: number
  activeRobots: number
  chargingRobots: number
  idleRobots: number
  errorRobots: number
  offlineRobots: number

  activeMissions: number
  completedToday: number
  areaCoveredToday: number // m²

  robots: RobotDevice[]
  missions: RobotMission[]
}

export interface MissionPlan {
  locationId: string
  type: MissionType
  scheduledStart: Date
  estimatedDuration: number // minutes
  recommendedRobot?: RobotDevice
  parameters: RobotMission['parameters']
}

export interface RobotTelemetry {
  robotId: string
  timestamp: Date
  position: {
    latitude: number
    longitude: number
    heading: number // degrees
  }
  batteryLevel: number
  speed: number // m/s
  status: RobotStatus
  sensors?: {
    temperature?: number
    vibration?: number
    bladeRPM?: number
  }
}

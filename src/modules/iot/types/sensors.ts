/**
 * IoT Sensor Type Extensions
 * Additional sensor types for comprehensive monitoring
 */

export enum ExtendedSensorType {
  // Existing
  SOIL_MOISTURE = 'SOIL_MOISTURE',
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',

  // New sensors
  SOIL_PH = 'SOIL_PH',
  SOIL_NPK = 'SOIL_NPK',
  TURF_FIRMNESS = 'TURF_FIRMNESS',
  LIGHT_INTENSITY = 'LIGHT_INTENSITY',
  CO2_LEVEL = 'CO2_LEVEL',
  ROOT_DEPTH = 'ROOT_DEPTH',
  WATER_FLOW = 'WATER_FLOW',
  WIND_SPEED = 'WIND_SPEED',
  RAIN_GAUGE = 'RAIN_GAUGE',
  SOIL_SALINITY = 'SOIL_SALINITY',
  LEAF_WETNESS = 'LEAF_WETNESS',
}

export interface SoilPHReading {
  pH: number // 0-14
  timestamp: Date
  locationId: string
  depth: number // cm
}

export interface NPKReading {
  nitrogen: number // ppm
  phosphorus: number // ppm
  potassium: number // ppm
  timestamp: Date
  locationId: string
  depth: number // cm
}

export interface TurfFirmnessReading {
  firmness: number // 0-100 (Clegg impact value)
  timestamp: Date
  locationId: string
}

export interface LightIntensityReading {
  lux: number
  par: number // Photosynthetically Active Radiation
  timestamp: Date
  locationId: string
}

export interface CO2Reading {
  ppm: number
  timestamp: Date
  locationId: string
}

export interface RootDepthReading {
  depth: number // cm
  density: number // 0-100
  timestamp: Date
  locationId: string
}

export interface WaterFlowReading {
  flowRate: number // liters/minute
  totalVolume: number // liters
  pressure: number // PSI
  timestamp: Date
  zoneId: string
}

export interface WeatherStationReading {
  temperature: number // °C
  humidity: number // %
  windSpeed: number // m/s
  windDirection: number // degrees
  rainfall: number // mm
  solarRadiation: number // W/m²
  barometricPressure: number // mbar
  timestamp: Date
  stationId: string
}

export interface SoilSalinityReading {
  ec: number // Electrical Conductivity (dS/m)
  tds: number // Total Dissolved Solids (ppm)
  timestamp: Date
  locationId: string
  depth: number // cm
}

export interface LeafWetnessReading {
  wetness: number // 0-100%
  duration: number // minutes wet
  timestamp: Date
  locationId: string
}

export interface SensorAlert {
  id: string
  deviceId: string
  type: ExtendedSensorType
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  value: number
  threshold: number
  timestamp: Date
  acknowledged: boolean
}

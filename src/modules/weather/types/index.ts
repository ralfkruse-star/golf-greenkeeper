/**
 * Weather Module Types
 */

export interface WeatherSnapshot {
  id: string
  recordedAt: Date
  tempMin?: number
  tempMax?: number
  tempAvg?: number
  precipitation?: number
  humidity?: number
  windSpeed?: number
  et?: number // Evapotranspiration
  source?: string
  createdAt: Date
}

export interface WeatherForecast {
  date: Date
  tempMin: number
  tempMax: number
  tempAvg: number
  precipitation: number
  precipitationProbability: number
  humidity: number
  windSpeed: number
  windDirection: number
  uvIndex: number
  conditions: string
  icon: string
}

export interface WeatherAlert {
  id: string
  type: 'FROST' | 'HEAT' | 'HEAVY_RAIN' | 'DROUGHT' | 'WIND'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  startsAt: Date
  endsAt: Date
  recommendations: string[]
}

export interface WeatherBasedRecommendation {
  recommendationType: 'CANCEL_TASK' | 'RESCHEDULE_TASK' | 'CREATE_TASK' | 'ADJUST_IRRIGATION'
  taskId?: string
  reason: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  suggestedAction: string
  weatherCondition: string
}

export interface IrrigationRecommendation {
  locationId: string
  locationName: string
  currentMoisture?: number
  targetMoisture: number
  recommendedAmount: number // mm oder Liter
  reason: string
  urgency: 'LOW' | 'MEDIUM' | 'HIGH'
  scheduledFor?: Date
}

// OpenWeatherMap API Response Types
export interface OpenWeatherCurrentResponse {
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
    deg: number
  }
  rain?: {
    '1h': number
  }
  dt: number
}

export interface OpenWeatherForecastResponse {
  list: Array<{
    dt: number
    main: {
      temp: number
      temp_min: number
      temp_max: number
      humidity: number
    }
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
    wind: {
      speed: number
      deg: number
    }
    pop: number // Precipitation probability
    rain?: {
      '3h': number
    }
  }>
}

/**
 * Computer Vision Types
 */

export enum ImageAnalysisType {
  TURF_QUALITY = 'TURF_QUALITY',
  DISEASE_DETECTION = 'DISEASE_DETECTION',
  STRESS_ANALYSIS = 'STRESS_ANALYSIS',
  WEED_DETECTION = 'WEED_DETECTION',
  OVERALL_CONDITION = 'OVERALL_CONDITION',
}

export enum DiseaseType {
  DOLLAR_SPOT = 'DOLLAR_SPOT',
  BROWN_PATCH = 'BROWN_PATCH',
  PYTHIUM_BLIGHT = 'PYTHIUM_BLIGHT',
  FAIRY_RING = 'FAIRY_RING',
  RUST = 'RUST',
  SNOW_MOLD = 'SNOW_MOLD',
  UNKNOWN = 'UNKNOWN',
}

export interface ImageAnalysisResult {
  id: string
  imageUrl: string
  locationId?: string
  analysisType: ImageAnalysisType
  timestamp: Date

  // Quality scores (0-100)
  overallQuality: number
  color: number
  density: number
  uniformity: number

  // Disease detection
  diseases: Array<{
    type: DiseaseType
    confidence: number // 0-1
    severity: number // 0-100
    affectedArea: number // percentage
    location: {
      x: number
      y: number
      width: number
      height: number
    }
    recommendedTreatment: string
  }>

  // Stress indicators
  stressIndicators: {
    drought: number // 0-100
    heat: number
    compaction: number
    nutrientDeficiency: number
  }

  // Weeds
  weedCoverage: number // percentage
  weedTypes: string[]

  // AI insights
  aiSummary: string
  recommendations: string[]
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

  // Metadata
  capturedBy?: string
  device?: string
  weather?: {
    temperature: number
    conditions: string
  }
}

export interface GreenHealthAnalysis {
  locationId: string
  locationName: string
  healthScore: number // 0-100
  trendLast30Days: number[]

  issues: Array<{
    type: 'brown_patch' | 'disease' | 'stress' | 'wear' | 'weed'
    severity: number
    coordinates: [number, number]
    recommendedAction: string
    estimatedCost?: number
  }>

  comparisonToPeers: {
    yourScore: number
    clubAverage: number
    topPerformers: number
  }
}

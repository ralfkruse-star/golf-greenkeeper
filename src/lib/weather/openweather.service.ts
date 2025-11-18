/**
 * OpenWeather API Integration Service
 */

export interface OpenWeatherResponse {
  main: {
    temp: number
    humidity: number
  }
  wind: {
    speed: number
    deg: number
  }
  weather: Array<{
    description: string
  }>
  rain?: {
    '1h'?: number
  }
}

export class OpenWeatherService {
  private apiKey: string
  private baseUrl = 'https://api.openweathermap.org/data/2.5'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.WEATHER_API_KEY || ''
  }

  /**
   * Get current weather for location
   */
  async getCurrentWeather(lat: number, lon: number): Promise<OpenWeatherResponse> {
    if (!this.apiKey) {
      throw new Error('OpenWeather API key not configured')
    }

    const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Convert OpenWeather response to our format
   */
  convertToWeatherSnapshot(data: OpenWeatherResponse) {
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      precipitation: data.rain?.['1h'] || 0,
      windSpeed: data.wind.speed * 3.6, // m/s to km/h
      windDirection: this.degToCompass(data.wind.deg),
      source: 'API' as const,
    }
  }

  /**
   * Convert degrees to compass direction
   */
  private degToCompass(deg: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(deg / 45) % 8
    return directions[index]
  }

  /**
   * Get forecast for next days
   */
  async getForecast(lat: number, lon: number, days: number = 5) {
    if (!this.apiKey) {
      throw new Error('OpenWeather API key not configured')
    }

    const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&cnt=${days * 8}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.statusText}`)
    }

    return response.json()
  }
}

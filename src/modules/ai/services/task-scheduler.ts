/**
 * AI Task Scheduler
 * Intelligent task scheduling considering weather, resources, priorities
 */

import { WeatherService } from '@/modules/weather/services/weather-service'
import type { Task } from '@/modules/tasks/types'

export interface ScheduleOptimization {
  optimizedTasks: Array<{
    taskId: string
    title: string
    suggestedStart: Date
    suggestedAssignee?: string
    reasoning: string
    priority: number
  }>
  reasoning: string
  estimatedTimeSaved: number // minutes
  weatherConsiderations: string[]
  resourceConflicts: number
}

export class AITaskScheduler {
  private weatherService: WeatherService

  constructor(private prisma: any) {
    this.weatherService = new WeatherService(prisma)
  }

  /**
   * Optimize task schedule for next N days
   */
  async optimizeSchedule(
    days: number = 7,
    lat: number = 53.6355,
    lon: number = 10.2877
  ): Promise<ScheduleOptimization> {
    // Get pending tasks
    const tasks = await this.prisma.task.findMany({
      where: {
        status: {
          in: ['TODO', 'ASSIGNED'],
        },
      },
      include: {
        location: true,
        assignedTo: true,
        equipment: true,
      },
    })

    // Get weather forecast
    const forecast = await this.weatherService.getSevenDayForecast(lat, lon)

    // Get available greenkeepers
    const greenkeepers = await this.prisma.user.findMany({
      where: {
        role: {
          in: ['GREENKEEPER', 'HEAD_GREENKEEPER'],
        },
        active: true,
      },
    })

    const optimizedTasks: any[] = []
    const weatherConsiderations: string[] = []
    let resourceConflicts = 0

    // Simple scheduling algorithm
    // In production: use constraint programming or ML
    const scheduleByDay = new Map<string, any[]>()

    tasks.forEach((task: any) => {
      let bestDay = 0
      let bestScore = -Infinity
      let reasoning = []

      // Evaluate each day
      for (let day = 0; day < Math.min(days, forecast.length); day++) {
        const weather = forecast[day]
        let score = 0

        // Weather suitability
        if (task.title.toLowerCase().includes('mähen') || task.title.toLowerCase().includes('mow')) {
          // Prefer dry days for mowing
          if (weather.precipitation < 2 && weather.precipitationProbability < 0.3) {
            score += 50
            reasoning.push('Trockenes Wetter ideal für Mähen')
          } else if (weather.precipitation > 10) {
            score -= 100
            reasoning.push('Regen - Mähen verschieben')
          }
        }

        if (task.title.toLowerCase().includes('düngen') || task.title.toLowerCase().includes('fertiliz')) {
          // Prefer light rain after fertilization
          if (weather.precipitation > 2 && weather.precipitation < 8) {
            score += 60
            reasoning.push('Leichter Regen wäscht Dünger ein')
          }
        }

        // Temperature considerations
        if (weather.tempMax > 30) {
          score -= 20 // Hot days = stress for grass and workers
          reasoning.push('Hohe Temperaturen - früher Tagesbeginn empfohlen')
        }

        // Priority boost
        if (task.priority === 'URGENT') score += 100
        else if (task.priority === 'HIGH') score += 50
        else if (task.priority === 'MEDIUM') score += 20

        // Scheduled date proximity
        if (task.scheduledStart) {
          const scheduledDay = Math.floor(
            (new Date(task.scheduledStart).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
          const daysDiff = Math.abs(day - scheduledDay)
          score -= daysDiff * 10 // Penalty for moving away from scheduled date
        }

        if (score > bestScore) {
          bestScore = score
          bestDay = day
        }
      }

      // Assign to day
      const selectedDate = new Date()
      selectedDate.setDate(selectedDate.getDate() + bestDay)
      selectedDate.setHours(7, 0, 0, 0) // Default start time

      const dayKey = selectedDate.toISOString().split('T')[0]
      if (!scheduleByDay.has(dayKey)) {
        scheduleByDay.set(dayKey, [])
      }
      scheduleByDay.get(dayKey)!.push(task)

      // Assign greenkeeper (simple round-robin)
      const assignedTo = task.assignedTo || greenkeepers[optimizedTasks.length % greenkeepers.length]

      optimizedTasks.push({
        taskId: task.id,
        title: task.title,
        suggestedStart: selectedDate,
        suggestedAssignee: assignedTo?.id,
        reasoning: reasoning.join('; ') || 'Optimale Zeit basierend auf Priorität und Verfügbarkeit',
        priority: bestScore,
      })
    })

    // Check for resource conflicts
    scheduleByDay.forEach((dayTasks) => {
      const equipmentUsage = new Map<string, number>()
      dayTasks.forEach((task: any) => {
        if (task.equipmentId) {
          equipmentUsage.set(task.equipmentId, (equipmentUsage.get(task.equipmentId) || 0) + 1)
        }
      })
      equipmentUsage.forEach((count) => {
        if (count > 1) resourceConflicts++
      })
    })

    // Weather considerations
    forecast.slice(0, days).forEach((day, index) => {
      if (day.precipitation > 15) {
        weatherConsiderations.push(
          `Tag ${index + 1}: Starkregen (${day.precipitation.toFixed(0)}mm) - Außenarbeiten schwierig`
        )
      }
      if (day.tempMin < 2) {
        weatherConsiderations.push(`Tag ${index + 1}: Frostgefahr - Morgenstunden meiden`)
      }
    })

    // Sort by priority
    optimizedTasks.sort((a, b) => b.priority - a.priority)

    return {
      optimizedTasks,
      reasoning: `${tasks.length} Tasks für ${days} Tage optimiert unter Berücksichtigung von Wetter, Prioritäten und Ressourcen`,
      estimatedTimeSaved: tasks.length * 15, // Assume 15min saved per task through optimization
      weatherConsiderations,
      resourceConflicts,
    }
  }
}

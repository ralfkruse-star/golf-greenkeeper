/**
 * WebSocket Server for Real-time Updates
 *
 * Handles real-time notifications for:
 * - Task status changes
 * - Equipment status updates
 * - Sensor alerts
 * - Low stock warnings
 */

import { Server as HTTPServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { verifyAccessToken, TokenPayload } from '@/lib/auth/jwt'

export interface WSMessage {
  type: 'task_updated' | 'equipment_updated' | 'sensor_alert' | 'low_stock_alert' | 'ping' | 'pong'
  data?: any
  timestamp: Date
}

export interface AuthenticatedWebSocket extends WebSocket {
  user?: TokenPayload
  isAlive?: boolean
}

export class WebSocketManager {
  private wss: WebSocketServer | null = null
  private clients: Set<AuthenticatedWebSocket> = new Set()

  initialize(server: HTTPServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' })

    this.wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
      console.log('WebSocket connection attempt')

      // Extract token from query string
      const url = new URL(req.url!, `http://${req.headers.host}`)
      const token = url.searchParams.get('token')

      if (!token) {
        ws.close(1008, 'Authentication required')
        return
      }

      try {
        const user = verifyAccessToken(token)
        ws.user = user
        ws.isAlive = true

        this.clients.add(ws)
        console.log(`WebSocket authenticated: ${user.email} (${this.clients.size} total)`)

        // Send welcome message
        this.sendToClient(ws, {
          type: 'ping',
          data: { message: 'Connected to Golf Greenkeeper WebSocket' },
          timestamp: new Date(),
        })

        // Handle ping/pong for keepalive
        ws.on('pong', () => {
          ws.isAlive = true
        })

        ws.on('message', (message) => {
          try {
            const parsed = JSON.parse(message.toString())
            this.handleMessage(ws, parsed)
          } catch (error) {
            console.error('Invalid WebSocket message:', error)
          }
        })

        ws.on('close', () => {
          this.clients.delete(ws)
          console.log(`WebSocket disconnected: ${user.email} (${this.clients.size} remaining)`)
        })

        ws.on('error', (error) => {
          console.error('WebSocket error:', error)
          this.clients.delete(ws)
        })
      } catch (error) {
        console.error('WebSocket authentication failed:', error)
        ws.close(1008, 'Invalid token')
      }
    })

    // Heartbeat to detect broken connections
    const interval = setInterval(() => {
      this.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          this.clients.delete(ws)
          return ws.terminate()
        }

        ws.isAlive = false
        ws.ping()
      })
    }, 30000) // 30 seconds

    this.wss.on('close', () => {
      clearInterval(interval)
    })

    console.log('WebSocket server initialized on /ws')
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: any) {
    if (message.type === 'ping') {
      this.sendToClient(ws, {
        type: 'pong',
        timestamp: new Date(),
      })
    }
  }

  /**
   * Send message to specific client
   */
  private sendToClient(ws: AuthenticatedWebSocket, message: WSMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(message: WSMessage) {
    const payload = JSON.stringify(message)
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload)
      }
    })
  }

  /**
   * Send to specific user by email
   */
  sendToUser(email: string, message: WSMessage) {
    this.clients.forEach((client) => {
      if (client.user?.email === email && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
    })
  }

  /**
   * Send to users with specific role
   */
  sendToRole(role: string, message: WSMessage) {
    this.clients.forEach((client) => {
      if (client.user?.role === role && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
    })
  }

  /**
   * Notify about task update
   */
  notifyTaskUpdate(task: any) {
    this.broadcast({
      type: 'task_updated',
      data: task,
      timestamp: new Date(),
    })
  }

  /**
   * Notify about equipment update
   */
  notifyEquipmentUpdate(equipment: any) {
    this.broadcast({
      type: 'equipment_updated',
      data: equipment,
      timestamp: new Date(),
    })
  }

  /**
   * Notify about sensor alert
   */
  notifySensorAlert(alert: any) {
    this.broadcast({
      type: 'sensor_alert',
      data: alert,
      timestamp: new Date(),
    })
  }

  /**
   * Notify about low stock
   */
  notifyLowStock(material: any) {
    this.sendToRole('MANAGER', {
      type: 'low_stock_alert',
      data: material,
      timestamp: new Date(),
    })
  }

  getConnectedClients(): number {
    return this.clients.size
  }
}

// Singleton instance
export const wsManager = new WebSocketManager()

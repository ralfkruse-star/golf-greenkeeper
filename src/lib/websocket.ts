/**
 * WebSocket Utility
 * Real-time communication for live updates
 */

export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private listeners: Map<string, Set<Function>> = new Map()

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected')
          this.reconnectAttempts = 0
          this.startHeartbeat()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('[WebSocket] Disconnected')
          this.stopHeartbeat()
          this.attemptReconnect()
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.stopHeartbeat()
  }

  send(event: string, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }))
    } else {
      console.error('[WebSocket] Cannot send - not connected')
    }
  }

  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.off(event, callback)
    }
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.delete(callback)
    }
  }

  private handleMessage(data: { event: string; payload: any }): void {
    const callbacks = this.listeners.get(data.event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data.payload))
    }

    // Also trigger wildcard listeners
    const wildcardCallbacks = this.listeners.get('*')
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach((callback) => callback(data))
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(
      `[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    )

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[WebSocket] Reconnect failed:', error)
      })
    }, delay)
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ event: 'ping' }))
      }
    }, 30000) // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws'
    wsClient = new WebSocketClient(wsUrl)
  }
  return wsClient
}

// React hook for WebSocket
export function useWebSocket() {
  const [isConnected, setIsConnected] = React.useState(false)
  const ws = React.useRef<WebSocketClient | null>(null)

  React.useEffect(() => {
    ws.current = getWebSocketClient()

    ws.current.connect().then(() => {
      setIsConnected(true)
    })

    return () => {
      ws.current?.disconnect()
    }
  }, [])

  const subscribe = React.useCallback((event: string, callback: Function) => {
    return ws.current?.on(event, callback)
  }, [])

  const send = React.useCallback((event: string, data: any) => {
    ws.current?.send(event, data)
  }, [])

  return { isConnected, subscribe, send }
}

// Add React import for hook
import * as React from 'react'

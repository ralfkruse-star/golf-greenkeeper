/**
 * AI Assistant Types
 * RAG-based ChatGPT-style assistant for greenkeepers
 */

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    sources?: KnowledgeSource[]
    confidence?: number
    citations?: string[]
  }
}

export interface KnowledgeSource {
  id: string
  type: 'TURF_MANUAL' | 'DISEASE_DATABASE' | 'BEST_PRACTICES' | 'EQUIPMENT_MANUAL' | 'REGULATORY' | 'HISTORICAL_DATA'
  title: string
  excerpt: string
  relevanceScore: number
  url?: string
}

export interface ChatSession {
  id: string
  userId: string
  tenantId: string
  title?: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatRequest {
  message: string
  sessionId?: string
  context?: {
    locationId?: string
    taskId?: string
    equipmentId?: string
  }
}

export interface ChatResponse {
  sessionId: string
  message: ChatMessage
  suggestedActions?: SuggestedAction[]
}

export interface SuggestedAction {
  type: 'CREATE_TASK' | 'SCHEDULE_MAINTENANCE' | 'ORDER_MATERIAL' | 'ALERT_MANAGER' | 'VIEW_REPORT'
  label: string
  description: string
  params?: Record<string, any>
}

export interface KnowledgeDocument {
  id: string
  type: KnowledgeSource['type']
  title: string
  content: string
  tags: string[]
  category: string
  language: 'en' | 'de'
  verified: boolean
  embeddings?: number[] // Vector embeddings for semantic search
  createdAt: Date
  updatedAt: Date
}

export interface AIAssistantConfig {
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'local-llm'
  temperature: number
  maxTokens: number
  systemPrompt: string
  enableRAG: boolean
  topKDocuments: number
}

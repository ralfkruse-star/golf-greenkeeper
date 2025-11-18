/**
 * AI Assistant Service
 * RAG-based ChatGPT-style assistant for greenkeeper support
 */

import {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ChatSession,
  KnowledgeDocument,
  KnowledgeSource,
  SuggestedAction,
  AIAssistantConfig,
} from '../types/assistant'

export class AIAssistantService {
  private config: AIAssistantConfig

  constructor(private prisma: any) {
    this.config = {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: `You are an expert AI assistant for professional golf course greenkeepers.
You have deep knowledge of turf management, disease identification, equipment maintenance,
sustainable practices, and golf course operations. Provide practical, evidence-based advice
while considering weather conditions, regulations, and best practices. Always prioritize
environmental sustainability and worker safety.`,
      enableRAG: true,
      topKDocuments: 5,
    }
  }

  /**
   * Send a chat message and get AI response
   */
  async chat(request: ChatRequest, userId: string, tenantId: string): Promise<ChatResponse> {
    // Get or create session
    let sessionId = request.sessionId
    if (!sessionId) {
      sessionId = await this.createSession(userId, tenantId)
    }

    // Retrieve relevant knowledge if RAG is enabled
    let sources: KnowledgeSource[] = []
    if (this.config.enableRAG) {
      sources = await this.retrieveRelevantKnowledge(request.message, request.context)
    }

    // Build context from previous messages
    const session = await this.getSession(sessionId)
    const conversationHistory = session?.messages || []

    // Generate AI response (simulated - in production would call OpenAI/Claude API)
    const aiResponse = await this.generateResponse(
      request.message,
      conversationHistory,
      sources,
      request.context
    )

    // Save user message
    const userMessage: ChatMessage = {
      id: this.generateId(),
      role: 'user',
      content: request.message,
      timestamp: new Date(),
    }

    // Save assistant message
    const assistantMessage: ChatMessage = {
      id: this.generateId(),
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
      metadata: {
        sources,
        confidence: aiResponse.confidence,
        citations: sources.map((s) => s.title),
      },
    }

    // Update session
    await this.saveMessages(sessionId, [userMessage, assistantMessage])

    // Generate suggested actions
    const suggestedActions = await this.generateSuggestedActions(
      request.message,
      aiResponse.content,
      request.context
    )

    return {
      sessionId,
      message: assistantMessage,
      suggestedActions,
    }
  }

  /**
   * Retrieve relevant knowledge using RAG
   */
  private async retrieveRelevantKnowledge(
    query: string,
    context?: ChatRequest['context']
  ): Promise<KnowledgeSource[]> {
    // In production, this would:
    // 1. Generate embeddings for the query
    // 2. Perform vector similarity search
    // 3. Return top K most relevant documents

    // Simulated knowledge base
    const knowledgeBase: KnowledgeDocument[] = [
      {
        id: '1',
        type: 'DISEASE_DATABASE',
        title: 'Dollar Spot Disease - Identification and Treatment',
        content: `Dollar spot (Sclerotinia homoeocarpa) appears as silver-dollar-sized circular patches.
                  Treatment: Improve air circulation, reduce thatch, apply fungicides like DMI or QoI compounds.
                  Prevention: Proper nitrogen fertilization, avoid evening watering.`,
        tags: ['disease', 'fungus', 'dollar-spot'],
        category: 'diseases',
        language: 'en',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        type: 'BEST_PRACTICES',
        title: 'Optimal Mowing Heights for Different Turf Types',
        content: `Bentgrass greens: 0.125-0.156 inches (3.2-4.0mm)
                  Bermudagrass fairways: 0.5-0.75 inches (12-19mm)
                  Ryegrass rough: 2-3 inches (50-75mm)
                  Adjust based on season and play pressure.`,
        tags: ['mowing', 'maintenance', 'turf-height'],
        category: 'maintenance',
        language: 'en',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        type: 'EQUIPMENT_MANUAL',
        title: 'Triplex Mower Maintenance Schedule',
        content: `Daily: Check oil, clean grass, sharpen blades
                  Weekly: Lubricate bearings, check tire pressure
                  Monthly: Change oil, inspect belts, clean air filter
                  Seasonal: Full service, replace worn parts`,
        tags: ['equipment', 'maintenance', 'mower'],
        category: 'equipment',
        language: 'en',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        type: 'BEST_PRACTICES',
        title: 'Sustainable Water Management',
        content: `Use soil moisture sensors to optimize irrigation
                  Water early morning (4-8am) to reduce evaporation
                  Deep, infrequent watering promotes root growth
                  Consider drought-resistant grass varieties
                  Capture and reuse rainwater where possible`,
        tags: ['irrigation', 'sustainability', 'water'],
        category: 'sustainability',
        language: 'en',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Simple keyword matching (in production: use vector embeddings)
    const queryLower = query.toLowerCase()
    const keywords = queryLower.split(' ').filter((w) => w.length > 3)

    const scoredDocs = knowledgeBase
      .map((doc) => {
        const docText = `${doc.title} ${doc.content} ${doc.tags.join(' ')}`.toLowerCase()
        let score = 0

        // Calculate relevance score
        keywords.forEach((keyword) => {
          if (docText.includes(keyword)) {
            score += 1
          }
          // Boost if in title or tags
          if (doc.title.toLowerCase().includes(keyword)) score += 2
          if (doc.tags.some((tag) => tag.includes(keyword))) score += 1.5
        })

        return { doc, score }
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.topKDocuments)

    return scoredDocs.map((item) => ({
      id: item.doc.id,
      type: item.doc.type,
      title: item.doc.title,
      excerpt: item.doc.content.substring(0, 200) + '...',
      relevanceScore: item.score,
    }))
  }

  /**
   * Generate AI response using LLM
   */
  private async generateResponse(
    userMessage: string,
    history: ChatMessage[],
    sources: KnowledgeSource[],
    context?: ChatRequest['context']
  ): Promise<{ content: string; confidence: number }> {
    // In production, this would call OpenAI/Claude API
    // For now, simulate intelligent responses based on sources

    let response = ''
    let confidence = 0.7

    // Build context-aware response
    if (sources.length > 0) {
      confidence = 0.9
      response = `Based on my knowledge base, here's what I can tell you:\n\n`

      // Check for disease-related queries
      if (userMessage.toLowerCase().includes('spot') || userMessage.toLowerCase().includes('disease')) {
        response += `I've identified information about turf diseases. ${sources[0]?.excerpt || ''}\n\n`
        response += `**Recommended Actions:**\n`
        response += `- Inspect affected areas and document with photos\n`
        response += `- Check recent weather conditions (moisture, temperature)\n`
        response += `- Review recent fertilization and irrigation schedules\n`
        response += `- Consider fungicide application if confirmed\n\n`
        response += `Would you like me to help you create a treatment task or schedule a consultation?`
      }
      // Check for maintenance queries
      else if (
        userMessage.toLowerCase().includes('mow') ||
        userMessage.toLowerCase().includes('maintenance') ||
        userMessage.toLowerCase().includes('equipment')
      ) {
        response += `Here's guidance on maintenance best practices:\n\n`
        response += sources
          .slice(0, 2)
          .map((s) => `**${s.title}**\n${s.excerpt}`)
          .join('\n\n')
        response += `\n\nWould you like me to help schedule maintenance or create a work order?`
      }
      // Check for irrigation/water queries
      else if (
        userMessage.toLowerCase().includes('water') ||
        userMessage.toLowerCase().includes('irrigation')
      ) {
        response += `For optimal water management:\n\n`
        response += sources[0]?.excerpt || ''
        response += `\n\nI can check current soil moisture sensor readings and weather forecast to help optimize your irrigation schedule. Should I do that?`
      }
      // General query
      else {
        response += sources
          .slice(0, 3)
          .map((s, i) => `${i + 1}. **${s.title}**\n   ${s.excerpt}`)
          .join('\n\n')
        response += `\n\nLet me know if you need more specific information on any of these topics.`
      }
    } else {
      // No relevant sources found - provide general assistance
      confidence = 0.5
      response = `I understand you're asking about "${userMessage}". While I don't have specific documentation on this exact topic in my knowledge base, I can help you with:\n\n`
      response += `- Turf disease identification and treatment\n`
      response += `- Equipment maintenance and troubleshooting\n`
      response += `- Irrigation and water management\n`
      response += `- Task planning and scheduling\n`
      response += `- Best practices for course maintenance\n\n`
      response += `Could you provide more details about what you're trying to accomplish?`
    }

    // Add context-specific information
    if (context?.locationId) {
      response += `\n\n*Note: I can see you're working on a specific location. I can pull weather data, historical issues, and recent maintenance records for this area if helpful.*`
    }

    return { content: response, confidence }
  }

  /**
   * Generate suggested actions based on conversation
   */
  private async generateSuggestedActions(
    userMessage: string,
    aiResponse: string,
    context?: ChatRequest['context']
  ): Promise<SuggestedAction[]> {
    const actions: SuggestedAction[] = []

    const msgLower = userMessage.toLowerCase()

    // Disease-related actions
    if (msgLower.includes('disease') || msgLower.includes('spot') || msgLower.includes('fungus')) {
      actions.push({
        type: 'CREATE_TASK',
        label: 'Create Disease Inspection Task',
        description: 'Schedule a detailed inspection and photo documentation',
        params: {
          title: 'Disease Inspection',
          priority: 'HIGH',
        },
      })
      actions.push({
        type: 'ORDER_MATERIAL',
        label: 'Order Fungicide',
        description: 'Check inventory and order treatment materials',
      })
    }

    // Maintenance-related actions
    if (
      msgLower.includes('maintenance') ||
      msgLower.includes('service') ||
      msgLower.includes('repair')
    ) {
      actions.push({
        type: 'SCHEDULE_MAINTENANCE',
        label: 'Schedule Equipment Maintenance',
        description: 'Create maintenance work order',
      })
    }

    // Irrigation-related actions
    if (msgLower.includes('water') || msgLower.includes('irrigation') || msgLower.includes('dry')) {
      actions.push({
        type: 'VIEW_REPORT',
        label: 'View Soil Moisture Data',
        description: 'Check current sensor readings and irrigation history',
        params: {
          reportType: 'SOIL_MOISTURE',
        },
      })
    }

    // Alert management
    if (msgLower.includes('urgent') || msgLower.includes('emergency') || msgLower.includes('alert')) {
      actions.push({
        type: 'ALERT_MANAGER',
        label: 'Alert Head Greenkeeper',
        description: 'Send notification about urgent issue',
      })
    }

    return actions
  }

  /**
   * Create a new chat session
   */
  private async createSession(userId: string, tenantId: string): Promise<string> {
    const sessionId = this.generateId()
    // In production: store in database
    return sessionId
  }

  /**
   * Get chat session by ID
   */
  private async getSession(sessionId: string): Promise<ChatSession | null> {
    // In production: retrieve from database
    return null
  }

  /**
   * Save messages to session
   */
  private async saveMessages(sessionId: string, messages: ChatMessage[]): Promise<void> {
    // In production: store in database
  }

  /**
   * Get chat history for user
   */
  async getChatHistory(userId: string, limit: number = 10): Promise<ChatSession[]> {
    // In production: retrieve from database with pagination
    return []
  }

  /**
   * Delete chat session
   */
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    // In production: delete from database
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

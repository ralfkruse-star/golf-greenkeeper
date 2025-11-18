/**
 * Global Greenkeeper Network Types
 * Community knowledge sharing platform
 */

export enum PostCategory {
  TURF_MANAGEMENT = 'TURF_MANAGEMENT',
  DISEASE_PEST = 'DISEASE_PEST',
  EQUIPMENT = 'EQUIPMENT',
  SUSTAINABILITY = 'SUSTAINABILITY',
  WEATHER = 'WEATHER',
  REGULATIONS = 'REGULATIONS',
  BEST_PRACTICES = 'BEST_PRACTICES',
  CAREER = 'CAREER',
  GENERAL = 'GENERAL',
}

export enum PostType {
  QUESTION = 'QUESTION',
  DISCUSSION = 'DISCUSSION',
  SHOWCASE = 'SHOWCASE',
  TIP = 'TIP',
  PROBLEM = 'PROBLEM',
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export interface KnowledgePost {
  id: string
  type: PostType
  category: PostCategory
  status: PostStatus

  // Content
  title: string
  content: string
  tags: string[]
  photoUrls?: string[]

  // Author
  authorId: string
  authorName: string
  authorRole?: string
  authorLocation?: string

  // Engagement
  views: number
  likes: number
  commentCount: number
  savedCount: number

  // Question-specific
  hasAcceptedAnswer?: boolean
  acceptedAnswerId?: string

  // Location context
  climateZone?: string
  grassType?: string

  // Metadata
  featured: boolean
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface KnowledgeComment {
  id: string
  postId: string
  parentCommentId?: string // For nested replies

  // Content
  content: string
  photoUrls?: string[]

  // Author
  authorId: string
  authorName: string
  authorRole?: string

  // Engagement
  likes: number
  accepted: boolean // For Q&A accepted answers

  // Metadata
  verified: boolean
  createdAt: Date
  updatedAt: Date

  // Relations
  replies?: KnowledgeComment[]
}

export interface CreatePostRequest {
  type: PostType
  category: PostCategory
  title: string
  content: string
  tags: string[]
  photoUrls?: string[]
  climateZone?: string
  grassType?: string
}

export interface CreateCommentRequest {
  postId: string
  parentCommentId?: string
  content: string
  photoUrls?: string[]
}

export interface SearchPostsRequest {
  query?: string
  category?: PostCategory
  type?: PostType
  tags?: string[]
  sortBy?: 'recent' | 'popular' | 'unanswered'
  limit?: number
  offset?: number
}

export interface NetworkStats {
  totalPosts: number
  totalMembers: number
  totalComments: number
  activeToday: number
  topCategories: Array<{
    category: PostCategory
    count: number
  }>
  topContributors: Array<{
    userId: string
    userName: string
    postCount: number
    helpfulCount: number
  }>
}

export interface UserNetworkProfile {
  userId: string
  userName: string
  role: string
  location?: string
  climateZone?: string
  specialties: string[]
  joinedAt: Date

  stats: {
    postsCreated: number
    commentsPosted: number
    helpfulAnswers: number
    reputation: number
  }

  recentActivity: Array<{
    type: 'POST' | 'COMMENT' | 'LIKE'
    item: KnowledgePost | KnowledgeComment
    timestamp: Date
  }>
}

export interface TrendingTopic {
  topic: string
  count: number
  growth: number // percentage change
  posts: KnowledgePost[]
}

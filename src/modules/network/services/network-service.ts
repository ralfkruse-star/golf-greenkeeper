/**
 * Global Greenkeeper Network Service
 * Community knowledge sharing and collaboration
 */

import {
  KnowledgePost,
  KnowledgeComment,
  CreatePostRequest,
  CreateCommentRequest,
  SearchPostsRequest,
  PostCategory,
  PostType,
  PostStatus,
  NetworkStats,
  UserNetworkProfile,
  TrendingTopic,
} from '../types'

export class NetworkService {
  constructor(private prisma: any) {}

  /**
   * Create a new knowledge post
   */
  async createPost(request: CreatePostRequest, userId: string, userName: string): Promise<KnowledgePost> {
    const post: KnowledgePost = {
      id: this.generateId(),
      type: request.type,
      category: request.category,
      status: PostStatus.PUBLISHED,
      title: request.title,
      content: request.content,
      tags: request.tags,
      photoUrls: request.photoUrls,
      authorId: userId,
      authorName: userName,
      views: 0,
      likes: 0,
      commentCount: 0,
      savedCount: 0,
      climateZone: request.climateZone,
      grassType: request.grassType,
      featured: false,
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // In production: Save to database
    return post
  }

  /**
   * Search and filter posts
   */
  async searchPosts(request: SearchPostsRequest): Promise<{ posts: KnowledgePost[]; total: number }> {
    // Get all posts (in production: query database with filters)
    let posts = await this.getAllPosts()

    // Apply filters
    if (request.category) {
      posts = posts.filter((p) => p.category === request.category)
    }

    if (request.type) {
      posts = posts.filter((p) => p.type === request.type)
    }

    if (request.tags && request.tags.length > 0) {
      posts = posts.filter((p) => request.tags!.some((tag) => p.tags.includes(tag)))
    }

    if (request.query) {
      const queryLower = request.query.toLowerCase()
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(queryLower) ||
          p.content.toLowerCase().includes(queryLower) ||
          p.tags.some((t) => t.toLowerCase().includes(queryLower))
      )
    }

    // Sort
    const sortBy = request.sortBy || 'recent'
    if (sortBy === 'recent') {
      posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } else if (sortBy === 'popular') {
      posts.sort((a, b) => b.views + b.likes - (a.views + a.likes))
    } else if (sortBy === 'unanswered') {
      posts = posts
        .filter((p) => p.type === PostType.QUESTION && !p.hasAcceptedAnswer)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }

    const total = posts.length

    // Pagination
    const limit = request.limit || 20
    const offset = request.offset || 0
    posts = posts.slice(offset, offset + limit)

    return { posts, total }
  }

  /**
   * Get post by ID
   */
  async getPostById(postId: string): Promise<KnowledgePost | null> {
    // In production: query database
    const posts = await this.getAllPosts()
    const post = posts.find((p) => p.id === postId)

    if (post) {
      // Increment view count
      post.views++
    }

    return post || null
  }

  /**
   * Create a comment on a post
   */
  async createComment(request: CreateCommentRequest, userId: string, userName: string): Promise<KnowledgeComment> {
    const comment: KnowledgeComment = {
      id: this.generateId(),
      postId: request.postId,
      parentCommentId: request.parentCommentId,
      content: request.content,
      photoUrls: request.photoUrls,
      authorId: userId,
      authorName: userName,
      likes: 0,
      accepted: false,
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // In production: Save to database
    // Update post comment count
    const post = await this.getPostById(request.postId)
    if (post) {
      post.commentCount++
    }

    return comment
  }

  /**
   * Get comments for a post
   */
  async getComments(postId: string): Promise<KnowledgeComment[]> {
    // In production: query database
    // Simulated comments
    return [
      {
        id: 'comment_001',
        postId,
        content: 'Great question! I had the same issue last summer. Here\'s what worked for me...',
        authorId: 'user_002',
        authorName: 'Tom Wilson',
        authorRole: 'Head Greenkeeper',
        likes: 5,
        accepted: false,
        verified: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'comment_002',
        postId,
        content: 'Based on the photos, this looks like Dollar Spot. I recommend applying a DMI fungicide and improving air circulation.',
        authorId: 'user_003',
        authorName: 'Dr. Sarah Green',
        authorRole: 'Turf Agronomist',
        likes: 12,
        accepted: true,
        verified: true,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ]
  }

  /**
   * Accept an answer for a question post
   */
  async acceptAnswer(postId: string, commentId: string, authorId: string): Promise<void> {
    const post = await this.getPostById(postId)

    if (!post) {
      throw new Error('Post not found')
    }

    if (post.authorId !== authorId) {
      throw new Error('Only the post author can accept answers')
    }

    if (post.type !== PostType.QUESTION) {
      throw new Error('Only question posts can have accepted answers')
    }

    post.hasAcceptedAnswer = true
    post.acceptedAnswerId = commentId

    // In production: Update database
  }

  /**
   * Like a post
   */
  async likePost(postId: string, userId: string): Promise<void> {
    const post = await this.getPostById(postId)
    if (post) {
      post.likes++
    }
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<NetworkStats> {
    const posts = await this.getAllPosts()

    const categoryCounts = posts.reduce(
      (acc, post) => {
        acc[post.category] = (acc[post.category] || 0) + 1
        return acc
      },
      {} as Record<PostCategory, number>
    )

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category: category as PostCategory, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalPosts: posts.length,
      totalMembers: 1247,
      totalComments: posts.reduce((sum, p) => sum + p.commentCount, 0),
      activeToday: 89,
      topCategories,
      topContributors: [
        {
          userId: 'user_001',
          userName: 'Mike Johnson',
          postCount: 45,
          helpfulCount: 128,
        },
        {
          userId: 'user_002',
          userName: 'Tom Wilson',
          postCount: 38,
          helpfulCount: 95,
        },
        {
          userId: 'user_003',
          userName: 'Dr. Sarah Green',
          postCount: 29,
          helpfulCount: 234,
        },
      ],
    }
  }

  /**
   * Get trending topics
   */
  async getTrendingTopics(): Promise<TrendingTopic[]> {
    const posts = await this.getAllPosts()

    // Aggregate by tags
    const tagCounts: Record<string, number> = {}
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    const trending = Object.entries(tagCounts)
      .map(([topic, count]) => ({
        topic,
        count,
        growth: Math.random() * 50, // Simulated growth
        posts: posts.filter((p) => p.tags.includes(topic)).slice(0, 3),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return trending
  }

  /**
   * Get user network profile
   */
  async getUserProfile(userId: string): Promise<UserNetworkProfile> {
    const posts = await this.getAllPosts()
    const userPosts = posts.filter((p) => p.authorId === userId)

    return {
      userId,
      userName: 'John Doe',
      role: 'Head Greenkeeper',
      location: 'London, UK',
      climateZone: 'Temperate Maritime',
      specialties: ['Bentgrass Greens', 'Disease Management', 'Sustainability'],
      joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      stats: {
        postsCreated: userPosts.length,
        commentsPosted: 45,
        helpfulAnswers: 23,
        reputation: 850,
      },
      recentActivity: [],
    }
  }

  /**
   * Get all posts (simulated data)
   */
  private async getAllPosts(): Promise<KnowledgePost[]> {
    // In production: query database
    return [
      {
        id: 'post_001',
        type: PostType.QUESTION,
        category: PostCategory.DISEASE_PEST,
        status: PostStatus.PUBLISHED,
        title: 'Identifying circular brown patches on putting green',
        content: `I've noticed several circular brown patches appearing on our 5th green over the past week.
                  The patches are about 2-3 inches in diameter. Weather has been warm and humid.
                  Could this be Dollar Spot? Photos attached.`,
        tags: ['disease', 'dollar-spot', 'bentgrass', 'diagnosis'],
        photoUrls: ['photo1.jpg', 'photo2.jpg'],
        authorId: 'user_001',
        authorName: 'Mike Johnson',
        authorRole: 'Greenkeeper',
        authorLocation: 'Florida, USA',
        views: 156,
        likes: 8,
        commentCount: 5,
        savedCount: 12,
        hasAcceptedAnswer: true,
        acceptedAnswerId: 'comment_002',
        climateZone: 'Subtropical',
        grassType: 'Bentgrass',
        featured: false,
        verified: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'post_002',
        type: PostType.SHOWCASE,
        category: PostCategory.SUSTAINABILITY,
        status: PostStatus.PUBLISHED,
        title: 'Reduced water usage by 30% with smart irrigation',
        content: `After implementing soil moisture sensors and weather-based irrigation scheduling,
                  we've cut our water usage by 30% while maintaining excellent turf quality.
                  Here's our approach and results...`,
        tags: ['irrigation', 'sustainability', 'sensors', 'water-conservation'],
        photoUrls: ['dashboard.jpg'],
        authorId: 'user_004',
        authorName: 'Emma Davis',
        authorRole: 'Course Superintendent',
        authorLocation: 'California, USA',
        views: 342,
        likes: 45,
        commentCount: 18,
        savedCount: 67,
        climateZone: 'Mediterranean',
        featured: true,
        verified: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'post_003',
        type: PostType.TIP,
        category: PostCategory.EQUIPMENT,
        status: PostStatus.PUBLISHED,
        title: 'Pro tip: Extend mower blade life with proper sharpening',
        content: `Many greenkeepers over-sharpen their blades. Here's the right technique to
                  maximize blade life while maintaining cut quality...`,
        tags: ['equipment', 'maintenance', 'mowing', 'blades'],
        authorId: 'user_005',
        authorName: 'James Miller',
        authorRole: 'Equipment Manager',
        views: 89,
        likes: 15,
        commentCount: 7,
        savedCount: 34,
        featured: false,
        verified: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Global Greenkeeper Network Page
 * Community knowledge sharing platform
 */

'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

export default function NetworkPage() {
  const [selectedTab, setSelectedTab] = useState<'feed' | 'questions' | 'trending'>('feed')

  const posts = [
    {
      id: '1',
      type: 'QUESTION',
      title: 'Identifying circular brown patches on putting green',
      excerpt: "I've noticed several circular brown patches appearing on our 5th green...",
      author: 'Mike Johnson',
      authorRole: 'Greenkeeper',
      location: 'Florida, USA',
      category: 'DISEASE_PEST',
      tags: ['disease', 'dollar-spot', 'bentgrass'],
      views: 156,
      likes: 8,
      comments: 5,
      hasAcceptedAnswer: true,
      timeAgo: '3 days ago',
    },
    {
      id: '2',
      type: 'SHOWCASE',
      title: 'Reduced water usage by 30% with smart irrigation',
      excerpt: 'After implementing soil moisture sensors and weather-based irrigation scheduling...',
      author: 'Emma Davis',
      authorRole: 'Course Superintendent',
      location: 'California, USA',
      category: 'SUSTAINABILITY',
      tags: ['irrigation', 'sustainability', 'sensors'],
      views: 342,
      likes: 45,
      comments: 18,
      featured: true,
      timeAgo: '5 days ago',
    },
    {
      id: '3',
      type: 'TIP',
      title: 'Pro tip: Extend mower blade life with proper sharpening',
      excerpt: 'Many greenkeepers over-sharpen their blades. Here\'s the right technique...',
      author: 'James Miller',
      authorRole: 'Equipment Manager',
      location: 'Scotland, UK',
      category: 'EQUIPMENT',
      tags: ['equipment', 'maintenance', 'mowing'],
      views: 89,
      likes: 15,
      comments: 7,
      timeAgo: '1 day ago',
    },
  ]

  const trendingTopics = [
    { topic: 'disease-management', count: 45, growth: 23 },
    { topic: 'water-conservation', count: 38, growth: 15 },
    { topic: 'equipment-maintenance', count: 32, growth: 8 },
    { topic: 'bentgrass-greens', count: 28, growth: -5 },
  ]

  const topContributors = [
    { name: 'Dr. Sarah Green', posts: 29, helpful: 234, reputation: 4850 },
    { name: 'Mike Johnson', posts: 45, helpful: 128, reputation: 3920 },
    { name: 'Tom Wilson', posts: 38, helpful: 95, reputation: 3145 },
  ]

  const getPostTypeIcon = (type: string) => {
    const icons = {
      QUESTION: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
      SHOWCASE: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      TIP: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    }
    return icons[type as keyof typeof icons] || icons.QUESTION
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Global Network</h1>
            <p className="text-gray-600 mt-1">Connect with greenkeepers worldwide</p>
          </div>
          <Button variant="primary">Create Post</Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {(['feed', 'questions', 'trending'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                selectedTab === tab
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            {posts.map((post) => (
              <Card key={post.id} hoverable>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {getPostTypeIcon(post.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 cursor-pointer">
                            {post.title}
                          </h3>
                          {post.featured && <Badge variant="warning">Featured</Badge>}
                          {post.hasAcceptedAnswer && (
                            <Badge variant="success">
                              <svg className="w-3 h-3 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Answered
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{post.excerpt}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-600">
                        <span className="font-medium text-gray-900">{post.author}</span>
                        <span>•</span>
                        <span>{post.authorRole}</span>
                        <span>•</span>
                        <span>{post.location}</span>
                        <span>•</span>
                        <span>{post.timeAgo}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <button className="flex items-center gap-1 hover:text-primary-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.views}
                      </button>
                      <button className="flex items-center gap-1 hover:text-red-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.comments}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {trendingTopics.map((topic) => (
                    <div key={topic.topic} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">#{topic.topic}</p>
                        <p className="text-sm text-gray-600">{topic.count} posts</p>
                      </div>
                      <span className={`text-sm font-semibold ${topic.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {topic.growth > 0 ? '+' : ''}{topic.growth}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Contributors</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {topContributors.map((contributor, index) => (
                    <div key={contributor.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{contributor.name}</p>
                        <p className="text-xs text-gray-600">
                          {contributor.posts} posts • {contributor.helpful} helpful
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary-600">{contributor.reputation}</p>
                        <p className="text-xs text-gray-500">rep</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

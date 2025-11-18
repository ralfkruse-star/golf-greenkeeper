/**
 * Computer Vision Page
 * Upload and analyze turf photos
 */

'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function VisionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)

    // Simulate analysis (in production: upload to API)
    setTimeout(() => {
      setAnalysisResult({
        overallQuality: 87,
        color: 92,
        density: 85,
        uniformity: 84,
        diseases: [
          {
            type: 'DOLLAR_SPOT',
            confidence: 78,
            severity: 42,
            affectedArea: 5.2,
            treatment: 'Apply DMI fungicide, improve air circulation',
          },
        ],
        stressIndicators: {
          drought: 25,
          heat: 18,
          compaction: 12,
          nutrientDeficiency: 8,
        },
        weedCoverage: 3,
        recommendations: [
          'Apply fungicide treatment for dollar spot within 48 hours',
          'Increase irrigation frequency by 10% in affected area',
          'Schedule aeration to address minor compaction',
          'Monitor closely for disease spread',
        ],
      })
      setIsAnalyzing(false)
    }, 2500)
  }

  const recentAnalyses = [
    {
      id: '1',
      location: 'Green 5',
      quality: 87,
      date: '2 hours ago',
      thumbnail: '/placeholder.jpg',
      issues: ['Dollar Spot'],
    },
    {
      id: '2',
      location: 'Fairway 12',
      quality: 92,
      date: '5 hours ago',
      thumbnail: '/placeholder.jpg',
      issues: [],
    },
    {
      id: '3',
      location: 'Green 3',
      quality: 78,
      date: '1 day ago',
      thumbnail: '/placeholder.jpg',
      issues: ['Drought Stress', 'Weeds'],
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Computer Vision</h1>
          <p className="text-gray-600 mt-1">Analyze turf quality using AI-powered image analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload & Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Photo</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {/* File Upload */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      preview ? 'border-primary-300 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {preview ? (
                      <div className="space-y-4">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                        <Button variant="outline" onClick={() => {
                          setPreview(null)
                          setSelectedFile(null)
                          setAnalysisResult(null)
                        }}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="w-16 h-16 text-gray-400 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <p className="text-gray-700 font-medium mb-2">
                          Drop your photo here or click to browse
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Supports JPG, PNG (max 10MB)
                        </p>
                        <label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <Button variant="primary" as="span">
                            Choose File
                          </Button>
                        </label>
                      </>
                    )}
                  </div>

                  {selectedFile && !analysisResult && (
                    <Button
                      variant="primary"
                      fullWidth
                      size="lg"
                      onClick={handleAnalyze}
                      isLoading={isAnalyzing}
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Photo'}
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Analysis Results */}
            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="space-y-6">
                    {/* Overall Quality */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Quality</span>
                        <span className="text-2xl font-bold text-primary-600">
                          {analysisResult.overallQuality}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
                          style={{ width: `${analysisResult.overallQuality}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Color', value: analysisResult.color },
                        { label: 'Density', value: analysisResult.density },
                        { label: 'Uniformity', value: analysisResult.uniformity },
                      ].map((metric) => (
                        <div key={metric.label} className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900">{metric.value}%</p>
                          <p className="text-sm text-gray-600 mt-1">{metric.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Diseases */}
                    {analysisResult.diseases.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Detected Issues</h4>
                        {analysisResult.diseases.map((disease: any, i: number) => (
                          <div key={i} className="border border-red-200 rounded-lg p-4 bg-red-50 mb-3">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h5 className="font-semibold text-red-900">
                                  {disease.type.replace('_', ' ')}
                                </h5>
                                <p className="text-sm text-red-700 mt-1">
                                  Confidence: {disease.confidence}% | Severity: {disease.severity}%
                                </p>
                              </div>
                              <Badge variant="danger">{disease.affectedArea}% area</Badge>
                            </div>
                            <p className="text-sm text-red-800 mt-2">
                              <strong>Treatment:</strong> {disease.treatment}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                      <ul className="space-y-2">
                        {analysisResult.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button variant="primary" fullWidth>
                      Create Task from Analysis
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Recent Analyses */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Analyses</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {recentAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{analysis.location}</h4>
                          <p className="text-xs text-gray-500">{analysis.date}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{analysis.quality}%</div>
                        </div>
                      </div>
                      {analysis.issues.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {analysis.issues.map((issue, i) => (
                            <Badge key={i} variant="warning" size="sm">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      )}
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

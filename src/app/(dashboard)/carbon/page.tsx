/**
 * Carbon Credits Page
 * Blockchain-based carbon certificate management
 */

'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/dashboard/StatCard'

export default function CarbonPage() {
  const certificates = [
    {
      id: 'cert-001',
      type: 'CARBON_SEQUESTRATION',
      carbonAmount: 25.3,
      status: 'VERIFIED',
      period: { start: '2024-01-01', end: '2024-12-31' },
      tokenId: '#1',
      chain: 'Polygon',
      marketValue: 1265,
      verifiedBy: '0xVerifier...',
      verifiedAt: '2025-11-03',
      tradable: true,
    },
    {
      id: 'cert-002',
      type: 'EMISSION_REDUCTION',
      carbonAmount: 12.8,
      status: 'MINTED',
      period: { start: '2024-07-01', end: '2024-12-31' },
      tokenId: '#2',
      chain: 'Polygon',
      marketValue: 640,
      tradable: false,
    },
    {
      id: 'cert-003',
      type: 'SUSTAINABLE_PRACTICE',
      carbonAmount: 8.5,
      status: 'PENDING',
      period: { start: '2024-10-01', end: '2024-12-31' },
      tradable: false,
    },
  ]

  const stats = {
    totalCarbon: certificates.reduce((sum, c) => sum + c.carbonAmount, 0),
    totalValue: certificates.reduce((sum, c) => sum + (c.marketValue || 0), 0),
    verified: certificates.filter((c) => c.status === 'VERIFIED').length,
    pending: certificates.filter((c) => c.status === 'PENDING').length,
  }

  const getStatusColor = (status: string): 'success' | 'info' | 'warning' | 'default' => {
    const colors = {
      VERIFIED: 'success' as const,
      MINTED: 'info' as const,
      PENDING: 'warning' as const,
      RETIRED: 'default' as const,
    }
    return colors[status as keyof typeof colors] || 'default'
  }

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Carbon Credits</h1>
            <p className="text-gray-600 mt-1">Blockchain-verified sustainability certificates</p>
          </div>
          <Button variant="primary">Mint New Certificate</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Carbon Credits"
            value={`${stats.totalCarbon.toFixed(1)} t`}
            color="success"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            }
          />
          <StatCard
            title="Market Value"
            value={`$${stats.totalValue.toLocaleString()}`}
            color="primary"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            }
          />
          <StatCard
            title="Verified Certificates"
            value={stats.verified}
            color="info"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
          />
          <StatCard
            title="Pending Verification"
            value={stats.pending}
            color="warning"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>

        {/* Certificates List */}
        <div className="space-y-4">
          {certificates.map((cert) => (
            <Card key={cert.id} padding="none">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {getTypeLabel(cert.type)}
                      </h3>
                      <Badge variant={getStatusColor(cert.status)}>{cert.status}</Badge>
                      {cert.tradable && <Badge variant="success">Tradable</Badge>}
                    </div>
                    <p className="text-gray-600">
                      Period: {cert.period.start} to {cert.period.end}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-600">
                      {cert.carbonAmount} t
                    </div>
                    <p className="text-sm text-gray-600">CO₂e</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {cert.tokenId && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Token ID</p>
                      <p className="font-medium text-gray-900">{cert.tokenId}</p>
                    </div>
                  )}
                  {cert.chain && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Blockchain</p>
                      <p className="font-medium text-gray-900">{cert.chain}</p>
                    </div>
                  )}
                  {cert.marketValue && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Market Value</p>
                      <p className="font-medium text-gray-900">${cert.marketValue.toLocaleString()}</p>
                    </div>
                  )}
                  {cert.verifiedBy && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Verified By</p>
                      <p className="font-mono text-sm text-gray-900">{cert.verifiedBy}</p>
                    </div>
                  )}
                </div>

                {cert.status === 'VERIFIED' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">
                        Verified on {cert.verifiedAt}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View on Blockchain
                  </Button>
                  <Button variant="outline" size="sm">
                    Download Certificate
                  </Button>
                  {cert.status === 'VERIFIED' && cert.tradable && (
                    <Button variant="primary" size="sm">
                      List for Sale
                    </Button>
                  )}
                  {cert.status === 'PENDING' && (
                    <Button variant="warning" size="sm">
                      Submit for Verification
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>About Carbon Credits</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>
                Each carbon credit represents one tonne of CO₂ equivalent sequestered or emissions reduced through your sustainable golf course management practices. These certificates are minted as NFTs on the Polygon blockchain, providing immutable proof of your environmental impact.
              </p>
              <ul className="mt-4 space-y-2">
                <li><strong>Carbon Sequestration:</strong> CO₂ absorbed by grass, trees, and soil</li>
                <li><strong>Emission Reduction:</strong> Reduced emissions from sustainable practices</li>
                <li><strong>Sustainable Practice:</strong> Certified sustainable management methods</li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  )
}

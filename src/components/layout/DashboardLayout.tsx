/**
 * Dashboard Layout
 * Main layout wrapper for authenticated pages
 */

'use client'

import React, { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Mock user data - in production, get from auth context
  const user = {
    name: 'John Doe',
    email: 'john@golfclub.com',
    role: 'Head Greenkeeper',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} user={user} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

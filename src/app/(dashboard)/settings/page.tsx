/**
 * Settings Page
 * User preferences, tenant configuration, system settings
 */

'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

type SettingsTab = 'account' | 'notifications' | 'tenant' | 'integrations' | 'security'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [isSaving, setIsSaving] = useState(false)

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    name: 'John Doe',
    email: 'john.doe@golfclub.com',
    phone: '+1 234 567 8900',
    timezone: 'America/New_York',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    taskAssignments: true,
    taskDueDates: true,
    weatherAlerts: true,
    equipmentAlerts: true,
    sensorAlerts: true,
    weeklyReports: true,
    monthlyReports: false,
  })

  // Tenant settings
  const [tenantSettings, setTenantSettings] = useState({
    clubName: 'Greenfield Golf Club',
    address: '123 Golf Course Drive, Springfield, USA',
    numberOfHoles: 18,
    totalAcreage: 150,
    grassType: 'Bentgrass',
    timezone: 'America/New_York',
    currency: 'USD',
    measurementSystem: 'imperial',
  })

  // Integration settings
  const integrations = [
    {
      name: 'Weather API',
      provider: 'OpenWeatherMap',
      status: 'CONNECTED',
      lastSync: '5 minutes ago',
      icon: '🌤️',
    },
    {
      name: 'Irrigation Controller',
      provider: 'Rain Bird',
      status: 'CONNECTED',
      lastSync: '2 minutes ago',
      icon: '💧',
    },
    {
      name: 'IoT Sensors',
      provider: 'Fieldclimate',
      status: 'CONNECTED',
      lastSync: '1 minute ago',
      icon: '📡',
    },
    {
      name: 'Mapbox',
      provider: 'Mapbox',
      status: 'CONNECTED',
      lastSync: 'Real-time',
      icon: '🗺️',
    },
    {
      name: 'Blockchain',
      provider: 'Polygon',
      status: 'CONNECTED',
      lastSync: '10 minutes ago',
      icon: '⛓️',
    },
    {
      name: 'Email Service',
      provider: 'SendGrid',
      status: 'DISCONNECTED',
      lastSync: 'Never',
      icon: '📧',
    },
  ]

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    // TODO: Show success toast
  }

  const tabs: Array<{ id: SettingsTab; label: string; icon: string }> = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'tenant', label: 'Club Settings', icon: '⛳' },
    { id: 'integrations', label: 'Integrations', icon: '🔌' },
    { id: 'security', label: 'Security', icon: '🔒' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and system preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors rounded-lg ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <Input
                          type="text"
                          value={accountSettings.name}
                          onChange={(e) =>
                            setAccountSettings({ ...accountSettings, name: e.target.value })
                          }
                          fullWidth
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={accountSettings.email}
                          onChange={(e) =>
                            setAccountSettings({ ...accountSettings, email: e.target.value })
                          }
                          fullWidth
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={accountSettings.phone}
                          onChange={(e) =>
                            setAccountSettings({ ...accountSettings, phone: e.target.value })
                          }
                          fullWidth
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        <select
                          value={accountSettings.timezone}
                          onChange={(e) =>
                            setAccountSettings({ ...accountSettings, timezone: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Europe/Berlin">Berlin (CET)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          value={accountSettings.language}
                          onChange={(e) =>
                            setAccountSettings({ ...accountSettings, language: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="en">English</option>
                          <option value="de">Deutsch</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Format
                        </label>
                        <select
                          value={accountSettings.dateFormat}
                          onChange={(e) =>
                            setAccountSettings({ ...accountSettings, dateFormat: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="space-y-6">
                    {/* Channels */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Channels</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'emailNotifications', label: 'Email Notifications', icon: '📧' },
                          { key: 'pushNotifications', label: 'Push Notifications', icon: '📱' },
                          { key: 'smsNotifications', label: 'SMS Notifications', icon: '💬' },
                        ].map((channel) => (
                          <label
                            key={channel.key}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{channel.icon}</span>
                              <span className="font-medium text-gray-900">{channel.label}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={
                                notifications[channel.key as keyof typeof notifications] as boolean
                              }
                              onChange={(e) =>
                                setNotifications({
                                  ...notifications,
                                  [channel.key]: e.target.checked,
                                })
                              }
                              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Event Types */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Types</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'taskAssignments', label: 'Task Assignments', icon: '📋' },
                          { key: 'taskDueDates', label: 'Task Due Dates', icon: '⏰' },
                          { key: 'weatherAlerts', label: 'Weather Alerts', icon: '⛈️' },
                          { key: 'equipmentAlerts', label: 'Equipment Alerts', icon: '🚜' },
                          { key: 'sensorAlerts', label: 'Sensor Alerts', icon: '📡' },
                          { key: 'weeklyReports', label: 'Weekly Reports', icon: '📊' },
                          { key: 'monthlyReports', label: 'Monthly Reports', icon: '📈' },
                        ].map((event) => (
                          <label
                            key={event.key}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{event.icon}</span>
                              <span className="font-medium text-gray-900">{event.label}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={
                                notifications[event.key as keyof typeof notifications] as boolean
                              }
                              onChange={(e) =>
                                setNotifications({
                                  ...notifications,
                                  [event.key]: e.target.checked,
                                })
                              }
                              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Tenant Settings */}
            {activeTab === 'tenant' && (
              <Card>
                <CardHeader>
                  <CardTitle>Club Settings</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Club Name
                        </label>
                        <Input
                          type="text"
                          value={tenantSettings.clubName}
                          onChange={(e) =>
                            setTenantSettings({ ...tenantSettings, clubName: e.target.value })
                          }
                          fullWidth
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <Input
                          type="text"
                          value={tenantSettings.address}
                          onChange={(e) =>
                            setTenantSettings({ ...tenantSettings, address: e.target.value })
                          }
                          fullWidth
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Holes
                        </label>
                        <Input
                          type="number"
                          value={tenantSettings.numberOfHoles}
                          onChange={(e) =>
                            setTenantSettings({
                              ...tenantSettings,
                              numberOfHoles: parseInt(e.target.value),
                            })
                          }
                          fullWidth
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Acreage
                        </label>
                        <Input
                          type="number"
                          value={tenantSettings.totalAcreage}
                          onChange={(e) =>
                            setTenantSettings({
                              ...tenantSettings,
                              totalAcreage: parseInt(e.target.value),
                            })
                          }
                          fullWidth
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Grass Type
                        </label>
                        <select
                          value={tenantSettings.grassType}
                          onChange={(e) =>
                            setTenantSettings({ ...tenantSettings, grassType: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="Bentgrass">Bentgrass</option>
                          <option value="Bermuda">Bermuda</option>
                          <option value="Zoysia">Zoysia</option>
                          <option value="Ryegrass">Ryegrass</option>
                          <option value="Fescue">Fescue</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          value={tenantSettings.currency}
                          onChange={(e) =>
                            setTenantSettings({ ...tenantSettings, currency: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="JPY">JPY (¥)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Measurement System
                        </label>
                        <select
                          value={tenantSettings.measurementSystem}
                          onChange={(e) =>
                            setTenantSettings({
                              ...tenantSettings,
                              measurementSystem: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="imperial">Imperial (ft, in)</option>
                          <option value="metric">Metric (m, cm)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {integrations.map((integration, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{integration.icon}</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                            <p className="text-sm text-gray-600">{integration.provider}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Last sync: {integration.lastSync}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              integration.status === 'CONNECTED' ? 'success' : 'secondary'
                            }
                          >
                            {integration.status}
                          </Badge>
                          <Button
                            variant={
                              integration.status === 'CONNECTED' ? 'outline' : 'primary'
                            }
                            size="sm"
                          >
                            {integration.status === 'CONNECTED' ? 'Configure' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="space-y-6">
                    {/* Password */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <Input type="password" fullWidth />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <Input type="password" fullWidth />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <Input type="password" fullWidth />
                        </div>
                        <Button variant="primary">Update Password</Button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add an extra layer of security to your account
                      </p>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">Not Enabled</Badge>
                        <Button variant="outline">Enable 2FA</Button>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Active Sessions
                      </h3>
                      <div className="space-y-3">
                        {[
                          {
                            device: 'Chrome on Windows',
                            location: 'New York, USA',
                            lastActive: '5 minutes ago',
                            current: true,
                          },
                          {
                            device: 'Safari on iPhone',
                            location: 'New York, USA',
                            lastActive: '2 hours ago',
                            current: false,
                          },
                        ].map((session, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">{session.device}</p>
                                {session.current && (
                                  <Badge variant="success" size="sm">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {session.location} • {session.lastActive}
                              </p>
                            </div>
                            {!session.current && (
                              <Button variant="outline" size="sm">
                                Revoke
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-6 border-t border-red-200">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Irreversible actions that affect your account
                      </p>
                      <div className="space-y-3">
                        <Button variant="outline">Export All Data</Button>
                        <Button variant="outline" className="text-red-600 border-red-300">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

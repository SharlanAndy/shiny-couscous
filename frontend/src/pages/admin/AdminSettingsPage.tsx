import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

export function AdminSettingsPage() {
  const { showSuccess, showError } = useToast()
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'integrations' | 'security'>('general')
  const [settings, setSettings] = useState({
    siteName: 'Labuan FSA E-Submission System',
    siteUrl: 'https://submission.labuanfsa.gov.my',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxFileSize: 10, // MB
    allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  const handleSave = () => {
    // TODO: Implement API call to save settings
    showSuccess('Settings have been saved successfully.', 'Settings Saved')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure system settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', label: 'General' },
            { id: 'users', label: 'Users' },
            { id: 'integrations', label: 'Integrations' },
            { id: 'security', label: 'Security' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site URL
                </label>
                <input
                  type="url"
                  value={settings.siteUrl}
                  onChange={(e) => handleSettingChange('siteUrl', e.target.value)}
                  className="input w-full"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="maintenanceMode"
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                  Maintenance Mode
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">User Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="allowRegistration"
                  type="checkbox"
                  checked={settings.allowRegistration}
                  onChange={(e) => handleSettingChange('allowRegistration', e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="allowRegistration" className="ml-2 block text-sm text-gray-900">
                  Allow User Registration
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="requireEmailVerification"
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-900">
                  Require Email Verification
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Integration Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Gateway
                </label>
                <select className="input w-full">
                  <option>Stripe</option>
                  <option>PayPal</option>
                  <option>None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Service Provider
                </label>
                <select className="input w-full">
                  <option>SendGrid</option>
                  <option>Amazon SES</option>
                  <option>SMTP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cloud Storage Provider
                </label>
                <select className="input w-full">
                  <option>Amazon S3</option>
                  <option>Azure Blob Storage</option>
                  <option>Google Cloud Storage</option>
                  <option>Local Storage</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                  className="input w-full"
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed File Types
                </label>
                <input
                  type="text"
                  value={settings.allowedFileTypes.join(', ')}
                  onChange={(e) =>
                    handleSettingChange(
                      'allowedFileTypes',
                      e.target.value.split(',').map((s) => s.trim())
                    )
                  }
                  className="input w-full"
                  placeholder="pdf, doc, docx, jpg, png"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Comma-separated list of allowed file extensions
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (minutes)
                </label>
                <input type="number" defaultValue="30" className="input w-full" min="5" max="480" />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
          <button onClick={handleSave} className="btn btn-primary">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

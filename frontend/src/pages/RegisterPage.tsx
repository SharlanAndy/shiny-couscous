import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '@/api/client'
import { cn } from '@/lib/utils'

export function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions')
      return
    }

    if (passwordStrength < 3) {
      setError('Password is too weak. Please use a stronger password.')
      return
    }

    setLoading(true)

    try {
      const response = await apiClient.register(
        formData.email,
        formData.password,
        formData.fullName,
        'user'
      )

      // Registration successful, redirect to login
      navigate('/login?registered=true')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })

    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    return strength
  }

  const getPasswordStrengthColor = (): string => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'bg-red-500'
      case 2:
        return 'bg-yellow-500'
      case 3:
        return 'bg-blue-500'
      case 4:
        return 'bg-green-500'
      default:
        return 'bg-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="relative min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        {/* Back to Home - Positioned absolutely */}
        <div className="absolute top-6 left-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="max-w-md w-full">
          {/* Main Registration Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            {/* Card Header */}
            <div className="px-8 pt-10 pb-6 border-b border-slate-100">
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                Create Account
              </h1>
              <p className="text-sm text-slate-600">
                Labuan FSA E-Submission Portal
              </p>
            </div>

            {/* Form */}
            <form className="px-8 py-8 space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="input appearance-none relative block w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 rounded-md transition-all bg-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input appearance-none relative block w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 rounded-md transition-all bg-white"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="input appearance-none relative block w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 rounded-md transition-all bg-white"
                    placeholder="+60 12-345 6789"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input appearance-none relative block w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 rounded-md transition-all bg-white"
                    placeholder="Create a strong password"
                  />
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={cn('h-2 rounded-full transition-all', getPasswordStrengthColor())}
                            style={{ width: `${(passwordStrength / 4) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 min-w-[80px]">
                          {passwordStrength < 2
                            ? 'Weak'
                            : passwordStrength < 3
                              ? 'Medium'
                              : passwordStrength < 4
                                ? 'Strong'
                                : 'Very Strong'}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                        Use at least 8 characters with uppercase, lowercase, numbers, and special characters.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input appearance-none relative block w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 rounded-md transition-all bg-white"
                    placeholder="Re-enter your password"
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      Passwords do not match
                    </p>
                  )}
                </div>
              </div>

                <div className="pt-2">
                <div className="flex items-start">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="h-4 w-4 text-slate-700 focus:ring-slate-500 border-gray-300 rounded mt-1 cursor-pointer"
                  />
                  <label htmlFor="agreeToTerms" className="ml-3 block text-sm text-gray-700 cursor-pointer">
                    I agree to the{' '}
                    <Link to="/terms" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !formData.agreeToTerms}
                  className={cn(
                    'btn btn-primary w-full py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all',
                    (loading || !formData.agreeToTerms) && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-slate-900 hover:text-slate-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


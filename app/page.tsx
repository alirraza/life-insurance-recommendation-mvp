'use client'

import { useState } from 'react'
import { InsuranceFormData, InsuranceRecommendation } from '@/types'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { AuthForm } from '@/components/ui/AuthForm'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user, login, register, logout, loading: authContextLoading } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const defaultFormData: InsuranceFormData = {
    age: 0,
    income: 0,
    dependents: 0,
    riskTolerance: 'Low',
  }

  const [formData, setFormData] = useState<InsuranceFormData>(defaultFormData)
  const [recommendation, setRecommendation] = useState<InsuranceRecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState({
    age: false,
    income: false,
    dependents: false,
    riskTolerance: false,
  })

  const ageError =
    formData.age === 0
      ? 'Age is required'
      : formData.age < 18 || formData.age > 100
      ? 'Age must be between 18 and 100'
      : ''
  const incomeError =
    formData.income === 0
      ? 'Annual income is required'
      : formData.income < 0
      ? 'Annual income must be a positive number'
      : ''
  const dependentsError =
    formData.dependents === 0 && formData.dependents !== 0
      ? 'Number of dependents is required'
      : formData.dependents < 0 || formData.dependents > 10
      ? 'Dependents must be between 0 and 10'
      : ''
  const riskError =
    !['Low', 'Medium', 'High'].includes(formData.riskTolerance)
      ? 'Select a valid risk tolerance'
      : ''

  const isFormInvalid =
    !!ageError || !!incomeError || !!dependentsError || !!riskError

  const handleAuthSubmit = async (email: string, password: string) => {
    setAuthLoading(true)
    setAuthError(null)
    
    try {
      if (authMode === 'login') {
        await login(email, password)
      } else {
        await register(email, password)
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setRecommendation(null)

    if (isFormInvalid) {
      setLoading(false)
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const response = await fetch(`${apiUrl}/api/recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get recommendation')
      }

      setRecommendation(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof InsuranceFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'riskTolerance' ? parseInt(value) || 0 : value
    }))
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleBlur = (field: keyof InsuranceFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const riskToleranceOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' }
  ]

  if (authContextLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Life Insurance Recommendation
            </h1>
            <p className="text-lg text-gray-600">
              Sign in to get personalized life insurance recommendations
            </p>
          </div>

          <AuthForm
            mode={authMode}
            onSubmit={handleAuthSubmit}
            loading={authLoading}
            error={authError}
          />

          <div className="text-center mt-6">
            <p className="text-gray-600">
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login')
                  setAuthError(null)
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {authMode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
            <h1 className="text-4xl font-bold text-gray-900 text-center md:text-left">
              Life Insurance Recommendation
            </h1>
            <div className="flex items-center gap-2 md:gap-4 justify-center md:justify-end">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user.email}</span>
              </span>
              <Button
                onClick={logout}
                variant="primary"
                size="sm"
                className="ml-2"
              >
                Sign Out
              </Button>
            </div>
          </div>
          <p className="text-lg text-gray-600">
            Get personalized life insurance recommendations based on your profile
          </p>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age */}
                <div>
                  <Input
                    id="age"
                    label="Age"
                    type="number"
                    value={formData.age || ''}
                    onChange={(value) => handleInputChange('age', value)}
                    onBlur={() => handleBlur('age')}
                    min={18}
                    max={100}
                    required
                    placeholder="Enter your age"
                    error={touched.age && !!ageError}
                  />
                  {touched.age && ageError && <p className="text-xs text-red-600 mt-1">{ageError}</p>}
                </div>

                {/* Income */}
                <div>
                  <Input
                    id="income"
                    label="Annual Income ($)"
                    type="number"
                    value={formData.income || ''}
                    onChange={(value) => handleInputChange('income', value)}
                    onBlur={() => handleBlur('income')}
                    min={0}
                    required
                    allowDecimals
                    placeholder="Enter your annual income"
                    error={touched.income && !!incomeError}
                  />
                  {touched.income && incomeError && <p className="text-xs text-red-600 mt-1">{incomeError}</p>}
                </div>

                {/* Dependents */}
                <div>
                  <Input
                    id="dependents"
                    label="Number of Dependents"
                    type="number"
                    value={formData.dependents || ''}
                    onChange={(value) => handleInputChange('dependents', value)}
                    onBlur={() => handleBlur('dependents')}
                    min={0}
                    max={10}
                    required
                    placeholder="Enter number of dependents"
                    error={touched.dependents && !!dependentsError}
                  />
                  {touched.dependents && dependentsError && <p className="text-xs text-red-600 mt-1">{dependentsError}</p>}
                </div>

                {/* Risk Tolerance */}
                <div>
                  <Select
                    id="riskTolerance"
                    label="Risk Tolerance"
                    value={formData.riskTolerance}
                    onChange={(value) => handleInputChange('riskTolerance', value)}
                    onBlur={() => handleBlur('riskTolerance')}
                    options={riskToleranceOptions}
                    required
                    error={touched.riskTolerance && !!riskError}
                  />
                  {touched.riskTolerance && riskError && <p className="text-xs text-red-600 mt-1">{riskError}</p>}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || isFormInvalid}
                className="w-full"
              >
                {loading ? 'Getting Recommendation...' : 'Get Recommendation'}
              </Button>
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
              {error}
            </div>
          )}

          {/* Recommendation Display */}
          {recommendation && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Recommendation
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    {recommendation.recommendation}
                  </h3>
                  <p className="text-blue-800">
                    {recommendation.explanation}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Recommendation ID: {recommendation.id}</p>
                  <p>Generated on: {new Date(recommendation.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-center pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFormData(defaultFormData)
                      setRecommendation(null)
                      setError(null)
                      setTouched({ age: false, income: false, dependents: false, riskTolerance: false })
                    }}
                  >
                    Get Another Recommendation
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState } from 'react'
import { Input } from './Input'
import { Button } from './Button'

interface AuthFormProps {
  mode: 'login' | 'register'
  onSubmit: (email: string, password: string) => Promise<void>
  loading?: boolean
  error?: string | null
}

export function AuthForm({ mode, onSubmit, loading = false, error = null }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  })

  const isLogin = mode === 'login'
  const title = isLogin ? 'Sign In' : 'Create Account'
  const submitText = isLogin ? 'Sign In' : 'Create Account'

  // Validation
  const emailError = !email ? 'Email is required' : !email.includes('@') ? 'Invalid email format' : ''
  const passwordError = !password ? 'Password is required' : password.length < 6 ? 'Password must be at least 6 characters' : ''
  const confirmPasswordError = !isLogin && !confirmPassword ? 'Please confirm your password' : 
    !isLogin && confirmPassword !== password ? 'Passwords do not match' : ''

  const isFormInvalid = !!emailError || !!passwordError || (!isLogin && !!confirmPasswordError)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormInvalid) return
    await onSubmit(email, password)
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-2">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(value) => setEmail(String(value))}
            onBlur={() => handleBlur('email')}
            required
            placeholder="Enter your email"
            error={touched.email && !!emailError}
          />
          {touched.email && emailError && (
            <p className="text-xs text-red-600 mt-1">{emailError}</p>
          )}
        </div>

        <div>
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(value) => setPassword(String(value))}
            onBlur={() => handleBlur('password')}
            required
            placeholder="Enter your password"
            error={touched.password && !!passwordError}
          />
          {touched.password && passwordError && (
            <p className="text-xs text-red-600 mt-1">{passwordError}</p>
          )}
        </div>

        {!isLogin && (
          <div>
            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(value) => setConfirmPassword(String(value))}
              onBlur={() => handleBlur('confirmPassword')}
              required
              placeholder="Confirm your password"
              error={touched.confirmPassword && !!confirmPasswordError}
            />
            {touched.confirmPassword && confirmPasswordError && (
              <p className="text-xs text-red-600 mt-1">{confirmPasswordError}</p>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || isFormInvalid}
          className="w-full"
        >
          {loading ? 'Loading...' : submitText}
        </Button>
      </form>
    </div>
  )
} 
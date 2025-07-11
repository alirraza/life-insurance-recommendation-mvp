import React from 'react'

interface InputProps {
  id: string
  label: string
  type?: 'text' | 'number' | 'email' | 'password'
  value: string | number
  onChange: (value: string | number) => void
  onBlur?: () => void
  placeholder?: string
  min?: number
  max?: number
  required?: boolean
  disabled?: boolean
  className?: string
  allowDecimals?: boolean
  error?: boolean
}

export const Input: React.FC<InputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  min,
  max,
  required = false,
  disabled = false,
  className = '',
  allowDecimals = false,
  error = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'number') {
      const value = e.target.value
      if (allowDecimals) {
        const cleanValue = value.replace(/[^\d.]/g, '')
        const parts = cleanValue.split('.')
        const finalValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanValue
        const newValue = finalValue ? parseFloat(finalValue) : 0
        onChange(newValue)
      } else {
        const cleanValue = value.replace(/[^\d]/g, '')
        const newValue = cleanValue ? parseInt(cleanValue) : 0
        onChange(newValue)
      }
    } else {
      onChange(e.target.value)
    }
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type === 'number' ? 'text' : type}
        id={id}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        className={`form-input disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
        inputMode={type === 'number' ? 'numeric' : undefined}
      />
    </div>
  )
} 
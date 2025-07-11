export interface InsuranceFormData {
  age: number
  income: number
  dependents: number
  riskTolerance: 'Low' | 'Medium' | 'High'
}

export interface InsuranceRecommendation {
  recommendation: string
  explanation: string
}

export interface InsuranceSubmission {
  id: string
  age: number
  income: number
  dependents: number
  riskTolerance: string
  recommendation: string
  explanation: string
  createdAt: Date
} 
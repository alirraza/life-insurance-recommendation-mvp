export interface InsuranceFormData {
  age: number
  income: number
  dependents: number
  riskTolerance: 'Low' | 'Medium' | 'High'
}

export interface InsuranceRecommendation {
  id: string
  recommendation: string
  explanation: string
  createdAt: string
} 
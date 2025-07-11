import { z } from 'zod'

export const insuranceFormSchema = z.object({
  age: z.number().min(18).max(100),
  income: z.number().min(0),
  dependents: z.number().min(0).max(10),
  riskTolerance: z.enum(['Low', 'Medium', 'High']),
})

export type InsuranceFormSchema = z.infer<typeof insuranceFormSchema> 
import { Router } from 'express'
import { prisma } from '../lib/db.js'
import { z } from 'zod'

const router = Router()

// Validation schema
const insuranceFormSchema = z.object({
  age: z.number().min(18).max(100),
  income: z.number().min(0),
  dependents: z.number().min(0).max(10),
  riskTolerance: z.enum(['Low', 'Medium', 'High']),
})

// Recommendation engine function
function generateRecommendation(data) {
  const { age, income, dependents, riskTolerance } = data

  // Base coverage calculation (10x annual income)
  const baseCoverage = income * 10

  // Adjust coverage based on dependents
  const dependentMultiplier = 1 + (dependents * 0.2)
  let coverage = baseCoverage * dependentMultiplier

  // Adjust coverage based on risk tolerance
  switch (riskTolerance) {
    case 'Low':
      coverage *= 0.8
      break
    case 'Medium':
      coverage *= 1.0
      break
    case 'High':
      coverage *= 1.3
      break
  }

  // Determine term length based on age
  let termLength
  if (age < 30) {
    termLength = 30
  } else if (age < 40) {
    termLength = 25
  } else if (age < 50) {
    termLength = 20
  } else if (age < 60) {
    termLength = 15
  } else {
    termLength = 10
  }

  // Round coverage to nearest $50,000
  coverage = Math.round(coverage / 50000) * 50000

  // Ensure minimum coverage of $100,000
  coverage = Math.max(coverage, 100000)

  const recommendation = `Term Life – $${coverage.toLocaleString()} for ${termLength} years`

  let explanation = `Based on your profile, we recommend a ${termLength}-year term life insurance policy with $${coverage.toLocaleString()} in coverage. `
  
  if (dependents > 0) {
    explanation += `This coverage accounts for your ${dependents} dependent${dependents > 1 ? 's' : ''} and provides approximately ${Math.round(termLength * 12 / dependents)} months of income replacement per dependent. `
  }
  
  explanation += `Your ${riskTolerance.toLowerCase()} risk tolerance and ${age}-year age factor into this recommendation. This policy will help ensure your family's financial security in the event of unexpected circumstances.`

  return {
    recommendation,
    explanation
  }
}

router.post('/recommendation', async (req, res) => {
  try {
    // Validate input data
    const validatedData = insuranceFormSchema.parse(req.body)
    
    // Generate recommendation
    const recommendation = generateRecommendation(validatedData)
    
    // Store in database
    const submission = await prisma.insuranceSubmission.create({
      data: {
        age: validatedData.age,
        income: validatedData.income,
        dependents: validatedData.dependents,
        riskTolerance: validatedData.riskTolerance,
        recommendation: recommendation.recommendation,
        explanation: recommendation.explanation,
      },
    })
    
    return res.json({
      success: true,
      data: {
        id: submission.id,
        ...recommendation,
        createdAt: submission.createdAt,
      },
    })
  } catch (error) {
    console.error('Error processing recommendation:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.message
      })
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

export default router 
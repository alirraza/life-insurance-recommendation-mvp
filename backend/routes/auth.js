import { Router } from 'express'
import { prisma } from '../lib/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body)
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, passwordHash }
    })
    return res.json({ success: true, data: { id: user.id, email: user.email, createdAt: user.createdAt } })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Invalid input', details: error.message })
    }
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    return res.json({ success: true, token, data: { id: user.id, email: user.email } })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Invalid input', details: error.message })
    }
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router 
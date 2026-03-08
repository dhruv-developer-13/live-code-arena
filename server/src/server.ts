import cors from "cors";
import "dotenv/config";
import express from 'express'
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express'
const app = express()
// Global Clerk middleware — reads the token on every request
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(clerkMiddleware())
// Public route
app.get('/api/public', (req, res) => {
  res.json({ message: 'Anyone can see this' })
})
// Protected route — rejects unauthenticated requests automatically
app.get('/api/protected', requireAuth(), (req, res) => {
  const { userId } = getAuth(req)
  res.json({ message: `Hello user ${userId}` })
})
app.listen(3000, () => console.log('Server running on port 3000'))

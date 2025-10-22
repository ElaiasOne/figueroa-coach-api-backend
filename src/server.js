//   backend_figueroa_coach/src/server.js

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'

import authRoutes from './routes/auth.routes.js'
import planifRoutes from './routes/planificaciones.routes.js'
import { pool } from './config/db.js'

dotenv.config()

const app = express()
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || '*' // en prod poné tu dominio de Vercel

// Seguridad y CORS
app.use(helmet())
app.use(cors({ origin: FRONT_ORIGIN, credentials: true }))

// Parsers
app.use(express.json())

// Healthcheck
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Test conexión MySQL
pool.getConnection()
  .then(c => { c.release(); console.log('MySQL conectado ✅') })
  .catch(e => console.error('Error MySQL ❌', e.message))

// Rutas
app.get('/', (_req, res) => res.send({ ok: true, name: 'FIGUEROA COACH API' }))
app.use('/api', authRoutes)
app.use('/api', planifRoutes)

// Arranque
const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`))

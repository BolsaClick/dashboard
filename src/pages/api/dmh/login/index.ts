// /pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const INSCRICAO_OAUTH_URL = process.env.INSCRICAO_OAUTH_URL || ''
const INSCRICAO_CLIENT_ID = process.env.INSCRICAO_CLIENT_ID || ''
const INSCRICAO_CLIENT_SECRET = process.env.INSCRICAO_CLIENT_SECRET || ''
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*'

let cachedToken: string | null = null
let tokenExpiresAt: number | null = null

// === CORS Setup ===
function setCorsHeaders(req: NextApiRequest, res: NextApiResponse) {
  const origin = (req.headers.origin as string) || '*'
  const allowed = ALLOWED_ORIGINS === '*' ? ['*'] : ALLOWED_ORIGINS.split(',').map(s => s.trim())

  if (ALLOWED_ORIGINS === '*' || allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS === '*' ? '*' : origin)
    if (ALLOWED_ORIGINS !== '*') res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
}

// === Token Functions ===
async function fetchNewToken() {
  const params = new URLSearchParams()
  params.append('grant_type', 'client_credentials')
  params.append('client_id', INSCRICAO_CLIENT_ID)
  params.append('client_secret', INSCRICAO_CLIENT_SECRET)

  const response = await axios.post(INSCRICAO_OAUTH_URL, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })

  return response.data
}

async function getToken() {
  const now = Date.now()

  if (cachedToken && tokenExpiresAt && now < tokenExpiresAt) {
    return cachedToken
  }

  const tokenData = await fetchNewToken()

  cachedToken = tokenData.access_token
  tokenExpiresAt = now + tokenData.expires_in * 1000 - 60000 // 1 min antes

  return cachedToken
}

// === Handler ===
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const token = await getToken()
    return res.status(200).json({ access_token: token })
  } catch (error: any) {
    console.error('Erro ao obter token OAuth:', error.response?.data || error.message)
    return res.status(500).json({ error: 'Erro ao obter token OAuth' })
  }
}
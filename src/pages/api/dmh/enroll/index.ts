import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const INSCRICAO_API_URL = 'https://ingresso-api.kroton.com.br/ms/inscricaocqrs/captacao/v5/inscricao'
const INSCRICAO_SUBSCRIPTION_KEY = process.env.INSCRICAO_SUBSCRIPTION_KEY || ''
const INSCRICAO_OAUTH_URL = process.env.INSCRICAO_OAUTH_URL || ''
const INSCRICAO_CLIENT_ID = process.env.INSCRICAO_CLIENT_ID || ''
const INSCRICAO_CLIENT_SECRET = process.env.INSCRICAO_CLIENT_SECRET || ''
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*'

// 👉 Novo: Webhook do Discord para notificações
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || ''

let cachedToken: string | null = null
let tokenExpiresAt: number | null = null
let refreshingTokenPromise: Promise<string> | null = null

function setCorsHeaders(req: NextApiRequest, res: NextApiResponse) {
  const origin = (req.headers.origin as string) || '*'
  const allowed = ALLOWED_ORIGINS === '*' ? ['*'] : ALLOWED_ORIGINS.split(',').map(s => s.trim())

  if (ALLOWED_ORIGINS === '*' || allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS === '*' ? '*' : origin)
    if (ALLOWED_ORIGINS !== '*') res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization,Ocp-Apim-Subscription-key'
  )
}

async function fetchNewToken(): Promise<string> {
  const params = new URLSearchParams()
  params.append('grant_type', 'client_credentials')
  params.append('client_id', INSCRICAO_CLIENT_ID)
  params.append('client_secret', INSCRICAO_CLIENT_SECRET)

  const response = await axios.post(INSCRICAO_OAUTH_URL, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })

  return response.data.access_token
}

async function getToken(): Promise<string> {
  const now = Date.now()

  if (cachedToken && tokenExpiresAt && now < tokenExpiresAt) {
    return cachedToken
  }

  if (refreshingTokenPromise) {
    return refreshingTokenPromise
  }

  refreshingTokenPromise = fetchNewToken()
    .then(token => {
      cachedToken = token
      tokenExpiresAt = Date.now() + 60 * 60 * 1000 - 60000 // 1h validade menos 1 min
      refreshingTokenPromise = null
      return cachedToken
    })
    .catch(err => {
      refreshingTokenPromise = null
      throw err
    })

  return refreshingTokenPromise
}

async function makeEnrollmentRequest(token: string, body: any) {
  return axios.post(INSCRICAO_API_URL, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Ocp-Apim-Subscription-key': INSCRICAO_SUBSCRIPTION_KEY,
      'Content-Type': 'application/json'
    }
  })
}

// 👉 Função para notificar erros no Discord
async function notifyDiscordError(error: any, body: any) {
  if (!DISCORD_WEBHOOK_URL) return

  // Serializa body com fallback
  let payloadString: string
  try {
    payloadString = JSON.stringify(body, null, 2)
  } catch {
    payloadString = String(body)
  }

  // Evita mensagens muito longas no Discord (max ~2000 chars)
  if (payloadString.length > 1800) {
    payloadString = payloadString.slice(0, 1800) + "\n... (truncado)"
  }

  const errorMessage = {
    content: `⚠️ **Erro na inscrição**
**Mensagem:** ${error.message}
**Status:** ${error.response?.status || 'N/A'}
**Detalhes:** \`\`\`json
${JSON.stringify(error.response?.data || {}, null, 2)}
\`\`\`

**Body enviado:** \`\`\`json
${payloadString}
\`\`\``
  }

  try {
    await axios.post(DISCORD_WEBHOOK_URL, errorMessage)
  } catch (notifyErr) {
    console.error('Falha ao notificar Discord:', notifyErr)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const body = req.body

  if (!body) {
    return res.status(400).json({ error: 'Body da requisição é obrigatório' })
  }

  try {
    let token = await getToken()

    try {
      const response = await makeEnrollmentRequest(token, body)
      return res.status(response.status).json(response.data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token expirado, renova e tenta novamente
        token = await fetchNewToken()
        cachedToken = token
        tokenExpiresAt = Date.now() + 60 * 60 * 1000 - 60000

        const retryResponse = await makeEnrollmentRequest(token, body)
        return res.status(retryResponse.status).json(retryResponse.data)
      }
      throw error
    }
  } catch (error: any) {
    console.error('Erro na inscrição:', error.response?.data || error.message)

    // 🔔 Notificar erro no Discord
    notifyDiscordError(error, body)

    return res.status(500).json({
      error: 'Erro ao processar inscrição',
      detail: error.response?.data || error.message
    })
  }
}
import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'

// Secret do AbacatePay (use variável de ambiente em produção)
const ABACATE_SECRET = process.env.ABACATE_WEBHOOK_SECRET || '@Murilo2016'

// Configuração do CORS
const cors = Cors({
  methods: ['POST', 'OPTIONS'],
  origin: '*', // libera para qualquer origem
  allowedHeaders: ['Content-Type', 'x-abacatepay-secret'],
})

// Helper para rodar o middleware
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result)
      return resolve(result)
    })
  })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  // validar secret vindo do header ou query
  const receivedSecret =
    (req.headers['x-abacatepay-secret'] as string) ||
    (req.query.webhookSecret as string)

  if (receivedSecret !== ABACATE_SECRET) {
    console.warn('[ABACATE_WEBHOOK] Secret inválido:', receivedSecret)
    return res.status(401).send('Unauthorized')
  }

  try {
    const payload = req.body

    console.log('[ABACATE_WEBHOOK] payload recebido:', payload)

    // Exemplo: quando um Pix QR Code é lançado (event = pix.qr_code.created)
    if (payload?.event === 'pix.qr_code.created') {
      console.log('[ABACATE_WEBHOOK] Novo Pix QR Code criado:', payload.data)
    }

    // Exemplo: quando um pagamento é confirmado (event = billing.paid)
    if (payload?.event === 'billing.paid') {
      console.log('[ABACATE_WEBHOOK] Pagamento confirmado:', payload.data)
    }

    return res.status(200).json({ received: true, event: payload?.event })
  } catch (err: any) {
    console.error('[ABACATE_WEBHOOK_ERROR]', err)
    return res.status(500).send('Erro interno')
  }
}

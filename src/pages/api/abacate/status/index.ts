// pages/api/payment/status.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'

// CORS
const cors = Cors({
  methods: ['GET', 'OPTIONS'],
  origin: '*', // ajuste em produção
  allowedHeaders: ['Content-Type'],
})

const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result)
      return resolve(result)
    })
  })

// store em memória (mesmo do webhook)
const STORE: Record<string, any> = (global as any)._PAYMENT_STORE || {}
if (!(global as any)._PAYMENT_STORE) (global as any)._PAYMENT_STORE = STORE

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors)

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' })

  const { transactionId } = req.query
  if (!transactionId || typeof transactionId !== 'string') {
    return res.status(400).json({ error: 'transactionId é obrigatório' })
  }

  try {
    const record = STORE[transactionId]
    if (!record) {
      return res.status(200).json({ paid: false, found: false })
    }

    return res.status(200).json({
      paid: !!record.paid,
      found: true,
      summary: record.summary ?? null,
    })
  } catch (err) {
    console.error('[PAYMENT_STATUS_ERROR]', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
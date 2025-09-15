import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'

// Secret (use env em produção)
const ABACATE_SECRET = process.env.ABACATE_WEBHOOK_SECRET || '@Murilo2016'

// CORS (para Postman/dev)
const cors = Cors({
  methods: ['POST', 'OPTIONS'],
  origin: '*',
  allowedHeaders: ['Content-Type', 'x-abacatepay-secret'],
})

const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result)
      return resolve(result)
    })
  })

// store simples em memória (somente para dev/testing)
const webhookStore: { id: string; receivedAt: string; payload: any; summary: any }[] = []

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors)

  // quick debug logs
  console.log('[ABACATE_WEBHOOK] incoming method=', req.method)

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  // validar secret via header(s) ou query param (dev)
  const receivedSecret =
    (req.headers['x-abacatepay-secret'] as string) ||
    (req.headers['X-Abacatepay-Secret'] as string) ||
    (req.headers['x-webhook-secret'] as string) ||
    (req.query.webhookSecret as string)

  if (receivedSecret !== ABACATE_SECRET) {
    console.warn('[ABACATE_WEBHOOK] Secret inválido:', receivedSecret)
    return res.status(401).send('Unauthorized')
  }

  try {
    const payload = req.body // Next.js já faz o parsing JSON por padrão
    console.log('[ABACATE_WEBHOOK] payload recebido (summary):', {
      event: payload?.event,
      id: payload?.data?.id ?? payload?.data?.pixQrCode?.id,
    })

    const event: string | undefined = payload?.event
    const data: any = payload?.data ?? {}

    // extrair status / transaction id / amount / metadata com fallbacks
    const transactionId =
      data?.pixQrCode?.id ?? data?.payment?.id ?? data?.transaction?.id ?? data?.id ?? null

    const rawStatus =
      data?.pixQrCode?.status ??
      data?.payment?.status ??
      data?.transaction?.status ??
      data?.status ??
      null

    const status = rawStatus ? String(rawStatus).toUpperCase() : null

    const amount =
      data?.payment?.amount ?? data?.pixQrCode?.amount ?? data?.transaction?.amount ?? null

    const metadata =
      data?.pixQrCode?.metadata ??
      data?.payment?.metadata ??
      data?.transaction?.metadata ??
      data?.metadata ??
      {}

    const summary = {
      event,
      transactionId,
      status,
      amount,
      metadata,
    }

    // armazena em memória para inspecionar via logs / REPL (dev only)
    webhookStore.push({
      id: transactionId ?? `no-id-${Date.now()}`,
      receivedAt: new Date().toISOString(),
      payload,
      summary,
    })

    console.log('[ABACATE_WEBHOOK] resumo:', JSON.stringify(summary, null, 2))

    // Opcional: se quiser tratar apenas billing.paid como "confirmado", checar event
    // if (event === 'billing.paid') { ... }

    // responder rápido com resumo
    return res.status(200).json({ received: true, summary })
  } catch (err: any) {
    console.error('[ABACATE_WEBHOOK_ERROR]', err)
    return res.status(500).send('Erro interno')
  }
}
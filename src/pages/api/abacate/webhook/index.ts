import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import { prisma } from '@/lib/prisma' 

const ABACATE_SECRET = process.env.ABACATE_WEBHOOK_SECRET || '@Murilo2016'

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
    const event = payload?.event ?? null
    const data = payload?.data ?? {}

    // Tenta extrair transactionId de vários locais possíveis do payload
    const transactionId =
      data?.pixQrCode?.metadata?.transactionId ??
      data?.payment?.metadata?.transactionId ??
      data?.transaction?.metadata?.transactionId ??
      data?.metadata?.transactionId ??
      data?.pixQrCode?.metadata?.transaction_id ??
      data?.pixQrCode?.id ??
      data?.id ??
      null

    // status/vindos do provider (ex: "PAID", "PENDING")
    const rawStatus =
      data?.pixQrCode?.status ??
      data?.payment?.status ??
      data?.transaction?.status ??
      data?.status ??
      null
    const providerStatus = rawStatus ? String(rawStatus).toUpperCase() : null

    console.log('[ABACATE_WEBHOOK] event=', event, 'transactionId=', transactionId, 'providerStatus=', providerStatus)

    // Se não tem transactionId: ack e log (não retorna erro para evitar retries automáticos)
    if (!transactionId) {
      console.warn('[ABACATE_WEBHOOK] transactionId não encontrado no payload. Payload:', JSON.stringify(payload))
      return res.status(200).json({ received: true, found: false, message: 'no transactionId in payload' })
    }

    // Buscar transação no banco
    const trx = await prisma.transaction.findUnique({ where: { id: String(transactionId) } })
    if (!trx) {
      console.warn(`[ABACATE_WEBHOOK] transação não encontrada id=${transactionId}`)
      // ack para o provider, mas deixar log para investigação
      return res.status(200).json({ received: true, found: false })
    }

    // Idempotência: se já estiver paid, apenas ack
    if (trx.status === 'paid') {
      console.log(`[ABACATE_WEBHOOK] transação já em paid id=${transactionId}`)
      return res.status(200).json({ received: true, found: true, alreadyPaid: true })
    }

    // Condição para marcar como pago:
    // - evento específico do provider: billing.paid
    // - ou providerStatus igual a 'PAID'
    if (event === 'billing.paid' || providerStatus === 'PAID') {
      await prisma.transaction.update({
        where: { id: String(transactionId) },
        data: { status: 'paid' },
      })

      console.log(`[ABACATE_WEBHOOK] transação atualizada para paid id=${transactionId}`)

      // Opcional: aqui você pode disparar outras ações (enviar email, criar matrícula, etc.)

      return res.status(200).json({ received: true, found: true, updated: true })
    }

    // Caso o evento não represente pagamento finalizado
    console.log('[ABACATE_WEBHOOK] evento recebido, mas não é pagamento confirmado — nenhuma alteração feita')
    return res.status(200).json({ received: true, found: true, updated: false, event })
  } catch (err: any) {
    console.error('[ABACATE_WEBHOOK_ERROR]', err)
    // Retorna 500 caso ocorra erro interno (provider pode retryar)
    return res.status(500).json({ error: 'Erro interno', details: err?.message ?? String(err) })
  }
}
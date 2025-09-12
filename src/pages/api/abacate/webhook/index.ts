import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

const ABACATE_SECRET = process.env.ABACATE_WEBHOOK_SECRET || '@Murilo2016'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const receivedSecret =
    req.headers['x-abacatepay-secret'] ||
    req.headers['X-Abacatepay-Secret'] ||
    req.headers['x-webhook-secret'] ||
    req.query.webhookSecret

  if (receivedSecret !== ABACATE_SECRET) {
    console.warn('[ABACATE_WEBHOOK] Secret inválido:', receivedSecret)
    return res.status(401).send('Unauthorized')
  }

  try {
    const payload = req.body
    const { event, data } = payload

    if (event !== 'billing.paid') {
      console.log(`[ABACATE_WEBHOOK] Evento ignorado: ${event}`)
      return res.status(200).json({ received: true, ignored: true })
    }

    const metadata = data?.pixQrCode?.metadata

    if (!metadata?.userId || !metadata?.planId) {
      console.error('[ABACATE_WEBHOOK] Metadata ausente ou inválida:', metadata)
      return res.status(400).send('Metadata ausente')
    }


    // Aqui você deve buscar os dados do usuário e plano para criar o aluno
    // Exemplo simplificado:



    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('[ABACATE_WEBHOOK_ERROR]', error)
    return res.status(500).send('Erro interno')
  }
}
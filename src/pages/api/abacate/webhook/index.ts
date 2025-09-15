import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import { sendLeadToHubspot } from '@/lib/hubspot'

const ABACATE_SECRET = process.env.ABACATE_WEBHOOK_SECRET || '@Murilo2016'

// Configuração CORS
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

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
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

    // Extrair status de locais possíveis
    const rawStatus =
      data?.pixQrCode?.status ??
      data?.payment?.status ??
      data?.transaction?.status ??
      data?.status ??
      null

    const status = rawStatus ? String(rawStatus).toUpperCase() : null

    // Só processa se for pago
    const isPaid = status === 'PAID' || status === 'COMPLETE' || status === 'CONFIRMED'

    if (!isPaid) {
      console.log('[ABACATE_WEBHOOK] Status recebido mas não é pago ->', status)
      return res.status(200).json({ received: true, ignored: true, status })
    }

    // Extrair metadata
    const metadata =
      data?.pixQrCode?.metadata ??
      data?.payment?.metadata ??
      data?.transaction?.metadata ??
      data?.metadata ??
      {}

    if (!metadata?.userId || !metadata?.planId) {
      console.error('[ABACATE_WEBHOOK] Metadata ausente ou inválida:', metadata)
      return res.status(400).send('Metadata ausente')
    }

    // Extrair valor (centavos)
    const amount =
      data?.payment?.amount ??
      data?.pixQrCode?.amount ??
      data?.transaction?.amount ??
      null

    // ✅ Só chama HubSpot se for pago
    const hubspotId = await sendLeadToHubspot({
      email: metadata.email,
      cpf: metadata.taxId,
      city: metadata.city || '',
      state: metadata.state || '',
      courseId: metadata.planId,
      courseName: metadata.courseName || '',
      brand: metadata.brand || '',
      modality: metadata.modality || '',
      unitId: metadata.unitId || '',
      phone: metadata.cellphone,
      name: metadata.name,
      firstName: metadata.name,
      offerId: metadata.offerId || '',
      typeCourse: metadata.typeCourse || '',
      paid: status || 'PAID',
      cep: metadata.postal_code || '',
      channel: metadata.channel || '',
    })

    console.log(`[ABACATE_WEBHOOK] Lead atualizado no HubSpot: ${hubspotId}`)

    return res.status(200).json({ ok: true, hubspotId })
  } catch (error: any) {
    console.error('[ABACATE_WEBHOOK_ERROR]', error)
    return res.status(500).send('Erro interno')
  }
}
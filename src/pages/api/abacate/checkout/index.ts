import type { NextApiRequest, NextApiResponse } from 'next'
import AbacatePay from 'abacatepay-nodejs-sdk'
import { prisma } from '@/lib/prisma' // ajuste conforme seu projeto

interface Customer {
  name: string
  cellphone: string
  email: string
  taxId: string
}

interface PixQrCodeRequest {
  // Aceita um dos dois:
  amount?: number            // exemplo: 119   (R$119,00) - enviado ao provider
  amountInCents?: number     // exemplo: 11900 (R$119,00)
  description?: string
  expiresIn?: number
  customer: Customer
  userId: string
  planId: string
  couponCode?: string        // 🔹 incluímos aqui
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS básico
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const abacateKey = process.env.ABACATEPAY_API_KEY
  if (!abacateKey) {
    console.error('[CREATE_PIX] ABACATEPAY_API_KEY não configurada')
    return res.status(500).json({ error: 'API key do AbacatePay não configurada' })
  }

  const abacate = AbacatePay(`${abacateKey}`)

  try {
    const body = req.body as PixQrCodeRequest
    const { amount: directAmount, amountInCents, description, expiresIn, customer, userId, planId, couponCode } = body

    if ((!directAmount && !amountInCents) || !customer || !userId || !planId) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes. Envie amount ou amountInCents, customer, userId e planId.' })
    }

    // calcula valor a enviar para o provider (em reais)
    const amount = typeof amountInCents === 'number'
      ? amountInCents / 100
      : (directAmount as number)

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'amount inválido' })
    }

    // Verifica usuário no banco
    const user = await prisma.userStudent.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Normaliza amount em centavos
    const amountInCentsFinal = typeof amountInCents === 'number'
      ? amountInCents
      : Math.round((directAmount as number) * 100)

    // Criar transação pendente
    let transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: amountInCentsFinal,
        status: 'pending',
        couponId: null, // será preenchido se tiver couponCode
      },
    })

    console.log('[CREATE_PIX] transaction criada', { transactionId: transaction.id, amount, userId })

    // 🔹 Se veio couponCode, vinculamos à transação mas NÃO incrementamos ainda
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      })

      if (!coupon) {
        return res.status(404).json({ error: 'Cupom não encontrado' })
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ error: 'Limite de usos atingido' })
      }

      transaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: { couponId: coupon.id },
      })

      console.log('[CREATE_PIX] cupom vinculado à transaction', { couponCode, transactionId: transaction.id })
    }

    // Monta payload pro provider
    const providerPayload = {
      amount, // ex: 119
      description: description || `Matrícula - ${user.name}`,
      expiresIn: expiresIn ?? 3600,
      customer: {
        name: customer.name,
        email: customer.email,
        cellphone: customer.cellphone,
        taxId: customer.taxId,
      },
      metadata: {
        transactionId: transaction.id,
        userId,
        planId,
        couponCode: couponCode || null, // opcional pra rastrear também no provider
      },
    }

    console.log('[CREATE_PIX] payload para AbacatePay:', JSON.stringify(providerPayload, null, 2))

    // Chamar SDK AbacatePay
    const billing = await abacate.pixQrCode.create(providerPayload as any)

    if (!billing) {
      await prisma.transaction.update({ where: { id: transaction.id }, data: { status: 'error' } })
      console.error('[CREATE_PIX] resposta vazia do provider')
      return res.status(502).json({ error: 'Resposta vazia do provider' })
    }

    console.log('[CREATE_PIX] resposta do provider:', JSON.stringify(billing, null, 2))

    // Retornar QR Code e transactionId
    return res.status(200).json({
      pixQrCode: billing,
      transactionId: transaction.id,
    })
  } catch (err: any) {
    console.error('[CREATE_PIX] erro:', err)
    return res.status(500).json({ error: 'Erro interno do servidor', details: err?.message ?? err })
  }
}
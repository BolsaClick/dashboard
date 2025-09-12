import type { NextApiRequest, NextApiResponse } from 'next'
import AbacatePay from 'abacatepay-nodejs-sdk'

interface Customer {
  name: string
  cellphone: string
  email: string
  taxId: string
}

interface PixQrCodeRequest {
  amount: number
  description?: string
  expiresIn?: number
  customer: Customer
  userId: string
  planId: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const abacate = AbacatePay(`${process.env.ABACATEPAY_API_KEY}`)

  try {
    const body = req.body as PixQrCodeRequest
    const { amount, description, customer, userId, planId } = body

    if (!amount || !customer || !userId || !planId) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes' })
    }

    const billing = await abacate.pixQrCode.create({
      amount,
      expiresIn: 3600,
      description: description || '',
      customer: {
        name: customer.name,
        cellphone: customer.cellphone,
        email: customer.email,
        taxId: customer.taxId,
      },
      metadata: {
        userId,
        planId,
        name: customer.name,
        email: customer.email,
        taxId: customer.taxId,
        cellphone: customer.cellphone,
      },
    } as any)

    return res.status(200).json(billing)
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
}
// pages/api/transactions/show-by-id.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { transactionId } = req.query

  if (!transactionId || typeof transactionId !== 'string') {
    return res.status(400).json({ error: 'transactionId é obrigatório' })
  }

  try {
    const trx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true }, 
    })

    if (!trx) {
      return res.status(404).json({ found: false, message: 'Transaction not found' })
    }

    return res.status(200).json({
      found: true,
      transaction: {
        id: trx.id,
        amount: trx.amount,
        status: trx.status,
        createdAt: trx.createdAt,
        updatedAt: trx.updatedAt,
      },
      user: trx.user
        ? {
            id: trx.user.id,
            name: trx.user.name,
            email: trx.user.email,
            cpf: trx.user.cpf,
          }
        : null,
    })
  } catch (err: any) {
    console.error('[SHOW_TRANSACTION_BY_ID_ERROR]', err)
    return res.status(500).json({ error: 'Erro interno', details: err?.message ?? err })
  }
}
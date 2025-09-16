// pages/api/transactions/show-by-id.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import { prisma } from '@/lib/prisma'

// Inicializa CORS para permitir todas origens
const cors = Cors({
  methods: ['GET', 'OPTIONS'],
  origin: '*', // libera qualquer origem (produção: defina domínios específicos)
})

// Helper para rodar middleware em Next.js
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result)
      return resolve(result)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // roda CORS
  await runMiddleware(req, res, cors)

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

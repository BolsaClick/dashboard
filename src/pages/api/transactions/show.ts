// pages/api/transactions/show.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, transactionId } = req.query

  try {
    if (typeof userId === 'string') {
      // Buscar usuário e suas transações
      const user = await prisma.userStudent.findUnique({
        where: { id: userId },
        include: {
          Transaction: true, // inclui todas as transações do usuário
        },
      })

      if (!user) {
        return res.status(404).json({ found: false, message: 'User not found' })
      }

      return res.status(200).json({
        found: true,
        type: 'user',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          createdAt: user.createdAt,
          // campos adicionais que quiser expor...
        },
        transactions: user.Transaction.map((t) => ({
          id: t.id,
          amount: t.amount,
          status: t.status,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        })),
      })
    }

    if (typeof transactionId === 'string') {
      // Buscar transação e usuário associado
      const trx = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true },
      })

      if (!trx) {
        return res.status(404).json({ found: false, message: 'Transaction not found' })
      }

      return res.status(200).json({
        found: true,
        type: 'transaction',
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
    }

    return res.status(400).json({ error: 'Informe userId ou transactionId na query' })
  } catch (err: any) {
    console.error('[SHOW_TRANSACTION_ERROR]', err)
    return res.status(500).json({ error: 'Erro interno', details: err?.message ?? err })
  }
}
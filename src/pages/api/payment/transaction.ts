import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';

const prisma = new PrismaClient();

const cors = Cors({
  methods: ['PATCH', 'OPTIONS'],
  origin: '*',
  allowedHeaders: ['Content-Type'],
});

const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);

  if (req.method === 'PATCH') {
    const { transactionId } = req.body;  

    if (!transactionId) {
      return res.status(400).json({ error: 'O ID da transação é obrigatório.' });
    }

    try {
      // Buscar a transação pelo ID
      const transaction = await prisma.transaction.findUnique({
        where: {
          id: transactionId,
        },
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada.' });
      }

      // Verificar se a transação já foi paga
   

      // Atualizar o status da transação para "paid"
      const updatedTransaction = await prisma.transaction.update({
        where: {
          id: transactionId,
        },
        data: {
          status: 'paid',
        },
      });

      return res.status(200).json({ message: 'Transação atualizada com sucesso.', updatedTransaction });
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return res.status(500).json({ error: 'Erro ao atualizar transação.' });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}

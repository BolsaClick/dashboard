import { NextApiRequest, NextApiResponse } from 'next';
import redis, { connectRedis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await connectRedis();

    // Exclui todas as chaves de todos os bancos de dados no Redis
    await redis.flushAll();

    return res.status(200).json({ message: 'Todos os dados foram excluídos de todos os bancos de dados Redis.' });
  } catch (error) {
    console.error('❌ Erro ao excluir dados do Redis:', error);
    return res.status(500).json({ error: 'Erro ao excluir dados.' });
  }
}

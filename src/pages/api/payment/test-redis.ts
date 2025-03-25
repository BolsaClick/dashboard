import { NextApiRequest, NextApiResponse } from 'next';
import redis, { connectRedis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectRedis(); 

    await redis.set('foo', 'bar');
    const result = await redis.get('foo');

    return res.status(200).json({ message: 'Conexão bem-sucedida!', value: result });
  } catch (error) {
    console.error('❌ Erro ao conectar ao Redis:', error);
    return res.status(500).json({ error: 'Erro ao conectar ao Redis' });
  }
}

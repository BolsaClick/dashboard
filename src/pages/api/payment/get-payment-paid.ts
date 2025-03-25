import { NextApiRequest, NextApiResponse } from 'next';
import redis, { connectRedis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await connectRedis();

  
    const filterId = req.query.id as string | undefined;

    const keys = await redis.keys('event:*');

    if (keys.length === 0) {
      return res.status(200).json({ message: 'Nenhuma atualização recente.' });
    }

// aqui o getpayment 
    const events = await Promise.all(keys.map((key) => redis.get(key)));

    const filteredEvents = events
      .map((event) => JSON.parse(event!))
      .filter((event: any) => {
        if (filterId) {
          return event.data.id === filterId;
        }
        return true; 
      });

    return res.status(200).json({ updates: filteredEvents });
  } catch (error) {
    console.error('❌ Erro ao buscar atualizações no Redis:', error);
    return res.status(500).json({ error: 'Erro ao buscar atualizações.' });
  }
}

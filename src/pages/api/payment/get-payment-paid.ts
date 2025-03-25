import { NextApiRequest, NextApiResponse } from 'next';
import redis, { connectRedis } from '@/lib/redis';
import Cors from "cors";

const cors = Cors({
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  origin: "*",
});

const runMiddleware = (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise((resolve, reject) => {
    cors(req, res, (result) => {
      if (result instanceof Error) {
        reject(result);
      } else {
        resolve(result);
      }
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await connectRedis();

    const filterId = req.query.id as string | undefined;
    const keys = await redis.keys('event:*');

    if (keys.length === 0) {
      return res.status(200).json({ updates: [] });
    }

    const events = await Promise.all(
      keys.map(async (key) => {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
      })
    );

    // **Achatar os eventos** para evitar problemas com arrays aninhados
    const flattenedEvents = events.flatMap((event) => 
      event?.updates ? event.updates : event
    );

    // Log para depuração
    console.log('🔍 Eventos processados:', JSON.stringify(flattenedEvents, null, 2));

    const filteredEvents = flattenedEvents.filter((event) => {
      if (!event?.data?.id) return false; // Garante que o evento tem a estrutura correta
      return filterId ? event.data.id === filterId : true;
    });

    return res.status(200).json({ updates: filteredEvents });
  } catch (error) {
    console.error('❌ Erro ao buscar atualizações no Redis:', error);
    return res.status(500).json({ error: 'Erro ao buscar atualizações.' });
  }
}

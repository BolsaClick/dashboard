import { NextApiRequest, NextApiResponse } from 'next';
import redis, { connectRedis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await connectRedis(); // Conecta ao Redis

    const webhookData = req.body;
    const eventId = `event:${webhookData.id}`;

    // Armazena os dados do webhook no Redis
    await redis.set(eventId, JSON.stringify(webhookData), { EX: 3600 }); 

    console.log('🔔 Webhook recebido e salvo no Redis:', webhookData);

    return res.status(200).json({ message: 'Webhook recebido e salvo com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

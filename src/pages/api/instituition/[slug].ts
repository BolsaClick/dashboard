import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'PATCH') {
    const { slug } = req.query; 
    const { status } = req.body;

   
    const validStatuses = ['active', 'inactive', 'pending', 'canceled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido. Valores permitidos: active, inactive, pending, canceled.' });
    }

    try {
      
      const university = await prisma.university.update({
        where: { slug: String(slug) },
        data: { status },
      });

      res.status(200).json(university);
    } catch (error) {
      console.error('Error updating university status:', error);
      res.status(500).json({ error: 'Failed to update university status.', details: error });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}

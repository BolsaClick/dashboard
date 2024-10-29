import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { 
      name, 
      slug, 
      site, 
      phone, 
      logo, 
      benefits, 
      notice, 
      about, 
      advantages, 
      content_html, 
      min_price, 
      max_discount, 
      partner_id, 
      status 
    } = req.body;

   
    const validStatuses = ['active', 'inactive', 'pending', 'canceled'];
    const statusToSave = validStatuses.includes(status) ? status : 'pending'; 

    try {
      const university = await prisma.university.create({
        data: {
          name,
          slug,
          site,
          phone,
          logo,
          benefits,
          notice,
          about,
          advantages,
          content_html,
          min_price,
          max_discount,
          partner_id,
          status: statusToSave, // Usar statusToSave aqui
        },
      });

      res.status(201).json(university);
    } catch (error) {
      console.error('Error during university registration:', error); 
      res.status(500).json({ error: 'University registration failed.', details: error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

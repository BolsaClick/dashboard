import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { slug, page = '1', perPage = '10', name = '', status } = req.query;

    try {

      if (slug && !Array.isArray(slug)) {
        const university = await prisma.university.findUnique({
          where: { slug },
        });

        if (!university) {
          return res.status(404).json({ error: 'Faculdade não encontrada.' });
        }

        return res.status(200).json({
          data: [university],
        });
      }

      const pageNumber = parseInt(page as string, 10);
      const perPageNumber = parseInt(perPage as string, 10);

      const where: any = {};


      if (status && typeof status === 'string') {
        if (status === 'all') {

        } else {

          where.status = status;
        }
      }


      if (name && typeof name === 'string') {
        where.OR = [
          {
            name: {
              contains: String(name), 
              mode: 'insensitive',
            },
          },
          {
            slug: {
              contains: name,
              mode: 'insensitive',
            },
          },
        ];
      }


      if (slug && typeof slug === 'string') {
        where.slug = slug;
      }

      const universities = await prisma.university.findMany({
        where,
        skip: (pageNumber - 1) * perPageNumber,
        take: perPageNumber,
        orderBy: {
          created_at: 'desc',
        },
      });

      const totalUniversities = await prisma.university.count({ where });

      return res.status(200).json({
        data: universities,
        total: totalUniversities,
        page: pageNumber,
        perPage: perPageNumber,
        totalPages: Math.ceil(totalUniversities / perPageNumber),
      });
    } catch (error) {
      console.error('Erro ao buscar universidades:', error);
      return res.status(500).json({ error: 'Erro ao buscar universidades.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}

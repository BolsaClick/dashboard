import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

interface QueryParams {
  email?: string;
  name?: string;
  page?: string;
  perPage?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { email, name, page = '1', perPage = '10' }: QueryParams = req.query as QueryParams;

    try {
      const filters: any = {};

      if (email) {
        filters.email = email;
      }

      if (name) {
        filters.name = {
          contains: name,
          mode: 'insensitive',
        };
      }

      const pageNumber = parseInt(page, 10);
      const perPageNumber = parseInt(perPage, 10);

      const users = await prisma.userStudent.findMany({
        where: filters,
        orderBy: {
          createdAt: 'desc', 
        },
        skip: (pageNumber - 1) * perPageNumber,
        take: perPageNumber,
      });

      const totalUsers = await prisma.userStudent.count({ where: filters });
      const usersWithoutPassword = users.map(({ password, ...user }) => user);

      return res.status(200).json({
        data: usersWithoutPassword,
        total: totalUsers,
        page: pageNumber,
        perPage: perPageNumber,
        totalPages: Math.ceil(totalUsers / perPageNumber),
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}

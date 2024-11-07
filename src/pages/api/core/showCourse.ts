import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verifique se o método da requisição é GET
    if (req.method === 'GET') {
      // Busca todos os cursos
      const courses = await prisma.course.findMany();
      
      // Retorna os cursos encontrados
      return res.status(200).json(courses);
    }

    // Se o método não for GET, retorna erro
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ error: 'Error fetching courses' });
  }
}

export default handler;

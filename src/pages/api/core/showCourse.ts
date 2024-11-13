import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';

const prisma = new PrismaClient();

const cors = Cors({
  methods: ['GET', 'POST', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  origin: '*', 
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
async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res);

  try {
    if (req.method === 'GET') {
      const courses = await prisma.course.findMany();
      
      return res.status(200).json(courses);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ error: 'Error fetching courses' });
  }
}

export default handler;

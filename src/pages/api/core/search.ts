// pages/api/courses/search.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import Cors from 'cors'

const prisma = new PrismaClient()

// Configuração do CORS
const cors = Cors({
  methods: ['GET'],
  origin: '*',
})

// Middleware para usar CORS com Promises
const runMiddleware = (req: NextApiRequest, res: NextApiResponse) =>
  new Promise((resolve, reject) => {
    cors(req, res, (result) => {
      if (result instanceof Error) reject(result)
      else resolve(result)
    })
  })

// Handler principal da API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res)

  const { q } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid query parameter: q' })
  }

  try {
    const courses = await prisma.course.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive',
        },
      },
      take: 5,
    })

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: 'Nenhum curso encontrado' })
    }

    const results = courses.map((course) => ({
      courseId: course.id,
      courseName: course.name,
      modality: 'distancia', 
      unitCity: 'São Paulo', 
      unitState: 'SP',       
    }))

    return res.status(200).json({ courses: results })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro ao buscar cursos:', error.message)
    } else {
      console.error('Erro inesperado:', error)
    }

    return res.status(500).json({ error: 'Erro ao buscar cursos' })
  }
}

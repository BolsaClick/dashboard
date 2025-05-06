import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const registerCoursePos = async (courseName: string, newCourseId: string) => {
  try {
    const existingCourse = await prisma.coursePos.findFirst({
      where: { name: courseName },
    })

    if (existingCourse) {
      if (!existingCourse.courseIds.includes(newCourseId)) {
        const updatedCourseIds = [...existingCourse.courseIds, newCourseId]
        await prisma.coursePos.update({
          where: { id: existingCourse.id },
          data: { courseIds: updatedCourseIds },
        })
      }
    } else {
      await prisma.coursePos.create({
        data: {
          name: courseName,
          courseIds: [newCourseId],
        },
      })
    }
  } catch (error) {
    console.error('Error registering pos course:', error)
    throw new Error('Error registering pos course')
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { courses } = req.body

    if (!courses || !Array.isArray(courses)) {
      return res.status(400).json({ error: 'Missing or invalid courses array' })
    }

    try {
      for (const course of courses) {
        const { course: courseName, courseId } = course

        if (!courseName || !courseId) {
          return res.status(400).json({ error: 'Missing course or courseId for one of the items' })
        }

        await registerCoursePos(courseName, courseId)
      }

      res.status(200).json({ message: 'Cursos de pós registrados com sucesso' })
    } catch (error) {
      console.error('Erro ao registrar cursos de pós:', error)
      res.status(500).json({ error: 'Erro ao registrar os cursos de pós' })
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' })
  }
}

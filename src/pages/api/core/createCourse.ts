import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const registerCourse = async (courseName: string, newCourseId: string) => {
  try {
    // Verifica se o curso já existe com o nome fornecido
    const existingCourse = await prisma.course.findFirst({
      where: { name: courseName },
    });

    if (existingCourse) {
      // Se o curso já existir, verifica se o novo courseId já está na lista
      if (!existingCourse.courseIds.includes(newCourseId)) {
        // Atualiza o curso adicionando o novo course_id à lista
        const updatedCourseIds = [...existingCourse.courseIds, newCourseId];
        await prisma.course.update({
          where: { id: existingCourse.id },
          data: { courseIds: updatedCourseIds },
        });
        console.log(`Course ${courseName} updated with new course_id.`);
      } else {
        console.log(`Course ${courseName} already contains the course_id.`);
      }
    } else {
      // Se o curso não existir, cria um novo curso
      await prisma.course.create({
        data: {
          name: courseName,
          courseIds: [newCourseId], // Inicia a lista com o primeiro course_id
        },
      });
      console.log(`Course ${courseName} created with new course_id.`);
    }
  } catch (error) {
    console.error('Error registering course:', error);
    throw new Error('Error registering course');
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { courses } = req.body;

    if (!courses || !Array.isArray(courses)) {
      return res.status(400).json({ error: 'Missing or invalid courses array' });
    }

    try {
      // Processar em massa os cursos fornecidos
      for (const course of courses) {
        const { course: courseName, courseId } = course;

        if (!courseName || !courseId) {
          return res.status(400).json({ error: 'Missing course or courseId for one of the items' });
        }

        // Chama a função registerCourse para cada curso
        await registerCourse(courseName, courseId);
      }

      res.status(200).json({ message: 'Cursos registrados com sucesso' });
    } catch (error) {
      console.error('Erro ao registrar cursos:', error);
      res.status(500).json({ error: 'Erro ao registrar os cursos' });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}

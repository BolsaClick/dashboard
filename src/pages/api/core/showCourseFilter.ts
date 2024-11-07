import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      // Passo 1: Obter os parâmetros de query
      const { courseId, state, city, modalidade, page = 1, limit = 10 } = req.query;

      // Definir o número de cursos a ser retornado (paginação)
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      // Se não for passado `courseId`, vamos retornar todos os cursos com paginação
      let courses;
      if (courseId) {
        // Caso tenha `courseId`, buscar o curso específico
        courses = await prisma.course.findMany({
          where: {
            id: String(courseId),  // Garantir que seja uma string
          },
        });

        if (courses.length === 0) {
          return res.status(404).json({ error: "Curso não encontrado." });
        }
      } else {
        // Paginação: Calcular o `skip` e `take`
        courses = await prisma.course.findMany({
          skip: (pageNumber - 1) * limitNumber, // Pular os cursos da página anterior
          take: limitNumber, // Limitar o número de cursos por página
        });
      }

      // Passo 2: Verificar se `state` ou `city` são arrays e pegar o primeiro valor
      const queryState = Array.isArray(state) ? state[0] : state || "SP"; // Estado padrão: SP
      const queryCity = Array.isArray(city) ? city[0] : city || "São Paulo"; // Cidade padrão: São Paulo

      // Passo 3: Realizar as requisições para a API externa para cada curso
      const apiResponses = await Promise.all(
        courses.map(async (course) => {
          const apiRequests = course.courseIds.map(async (id) => {
            const urlPresencial = `https://api.consultoriaeducacao.app.br/offers/v3/showCaseFilter?brand=anhanguera&modality=Presencial&city=${encodeURIComponent(queryCity)}&state=${encodeURIComponent(queryState)}&course=${id}&courseName=${course.name}&app=DC&size=8`;
            const urlDistancia = `https://api.consultoriaeducacao.app.br/offers/v3/showCaseFilter?brand=anhanguera&modality=A%20dist%C3%A2ncia&city=${encodeURIComponent(queryCity)}&state=${encodeURIComponent(queryState)}&course=${id}&courseName=${course.name}&app=DC&size=8`;
            const urlSemipresencial = `https://api.consultoriaeducacao.app.br/offers/v3/showCaseFilter?brand=anhanguera&modality=Semipresencial&city=${encodeURIComponent(queryCity)}&state=${encodeURIComponent(queryState)}&course=${id}&courseName=${course.name}&app=DC&size=8`;

            try {
              // Requisições para as três modalidades (presencial, a distância e semipresencial)
              const [presencialResponse, distanciaResponse, semipresencialResponse] = await Promise.all([ 
                axios.get(urlPresencial),
                axios.get(urlDistancia),
                axios.get(urlSemipresencial),
              ]);

              // Organizando a resposta
              const courseData: { [key: string]: any } = {
                courseId: id,
                presencial: presencialResponse.data,
                distancia: distanciaResponse.data,
                semipresencial: semipresencialResponse.data,
              };

              // Passo 4: Se a modalidade for passada, filtrar os dados
              if (typeof modalidade === 'string' && ['presencial', 'distancia', 'semipresencial'].includes(modalidade)) {
                return {
                  courseId: id,
                  [modalidade]: courseData[modalidade] || null, 
                };
              }

              // Se não passar modalidade, retornar todos os dados
              return courseData;

            } catch (error) {
              console.error(`Erro ao buscar dados para o curso ${course.name} (ID: ${id}):`, error);
              return {
                courseId: id,
                presencial: null,
                distancia: null,
                semipresencial: null,
              };
            }
          });

          // Retorna a resposta com base nas modalidades de cada curso
          return Promise.all(apiRequests);
        })
      );

      // Passo 5: Retornar os dados para o cliente
      res.status(200).json({
        courses: apiResponses.flat(),
        pagination: {
          page: pageNumber,
          limit: limitNumber,
        },
      });
    } catch (error) {
      console.error("Erro ao buscar dados do curso:", error);
      res.status(500).json({ error: "Erro ao buscar o curso e dados da API externa." });
    }
  } else {
    res.status(405).json({ error: "Método não permitido. Use GET." });
  }
}

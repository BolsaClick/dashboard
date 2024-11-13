import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
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


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res);

  if (req.method === "GET") {
    try {
      const { courseId, state, city, modalidade, page = 1, limit = 10 } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      let courses;
      if (courseId) {
        courses = await prisma.course.findMany({
          where: { id: String(courseId) },
        });

        if (courses.length === 0) {
          return res.status(404).json({ error: "Curso não encontrado." });
        }
      } else {
        courses = await prisma.course.findMany({
          skip: (pageNumber - 1) * limitNumber,
          take: limitNumber,
        });
      }

      const queryState = Array.isArray(state) ? state[0] : state || "SP";
      const queryCity = Array.isArray(city) ? city[0] : city || "São Paulo";

      const apiResponses = await Promise.all(
        courses.map(async (course) => {
          const apiRequests = course.courseIds.map(async (id) => {
            const urlPresencial = `https://api.consultoriaeducacao.app.br/offers/v3/showCaseFilter?brand=anhanguera&modality=Presencial&city=${encodeURIComponent(queryCity)}&state=${encodeURIComponent(queryState)}&course=${id}&courseName=${course.name}&app=DC&size=8`;
            const urlDistancia = `https://api.consultoriaeducacao.app.br/offers/v3/showCaseFilter?brand=anhanguera&modality=A%20dist%C3%A2ncia&city=${encodeURIComponent(queryCity)}&state=${encodeURIComponent(queryState)}&course=${id}&courseName=${course.name}&app=DC&size=8`;
            const urlSemipresencial = `https://api.consultoriaeducacao.app.br/offers/v3/showCaseFilter?brand=anhanguera&modality=Semipresencial&city=${encodeURIComponent(queryCity)}&state=${encodeURIComponent(queryState)}&course=${id}&courseName=${course.name}&app=DC&size=8`;

            try {
              const [presencialResponse, distanciaResponse, semipresencialResponse] = await Promise.all([
                axios.get(urlPresencial),
                axios.get(urlDistancia),
                axios.get(urlSemipresencial),
              ]);

              const courseData = {
                courseId: id,
                presencial: presencialResponse.data,
                distancia: distanciaResponse.data,
                semipresencial: semipresencialResponse.data,
              };

              // Remover modalidades vazias
              Object.keys(courseData).forEach((key) => {
                if (
                  courseData[key as keyof typeof courseData] &&
                  courseData[key as keyof typeof courseData].data &&
                  courseData[key as keyof typeof courseData].data.length === 0
                ) {
                  delete courseData[key as keyof typeof courseData];
                }
              });

              if (Object.keys(courseData).length <= 1) {
                // Se não houver modalidades com dados, retornar null para esse curso
                return null;
              }

              if (
                typeof modalidade === "string" &&
                ["presencial", "distancia", "semipresencial"].includes(modalidade)
              ) {
                return {
                  courseId: id,
                  [modalidade]: courseData[modalidade as keyof typeof courseData] || null,
                };
              }

              return courseData;
            } catch (error) {
              console.error(`Erro ao buscar dados para o curso ${course.name} (ID: ${id}):`, error);
              return null;
            }
          });

          const filteredApiRequests = (await Promise.all(apiRequests)).filter((course) => course !== null);
          return filteredApiRequests;
        })
      );

      // Filtrar cursos sem modalidades válidas
      const filteredResponses = apiResponses.flat().filter((course) => course !== null);

      res.status(200).json({
        courses: filteredResponses,
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

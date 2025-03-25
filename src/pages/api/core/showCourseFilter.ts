import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

const prisma = new PrismaClient();

const cors = Cors({
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  origin: "*",
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
      const { courseId, state, city, modalidade, brand, page = 1, limit = 10 } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      let courses;

      // Se um courseId for informado, verificamos se ele existe no banco
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

      const brands = Array.isArray(brand) ? brand : brand ? [brand] : ["anhanguera", "ampli", "unopar", "pitagoras"];

      const apiResponses = await Promise.all(
        courses.map(async (course) => {
          if (!course.courseIds || course.courseIds.length === 0) {
            console.warn(`Nenhum ID de curso externo encontrado para ${course.name}`);
            return null;
          }

          const apiRequests = course.courseIds.flatMap((id) =>
            brands.map(async (brand) => {
              const urlPresencial = `https://api.consultoriaeducacao.app.br/offers/v3/showCaseFilter?brand=${brand}&modality=Presencial&city=${encodeURIComponent(queryCity)}&state=${encodeURIComponent(queryState)}&course=${id}&courseName=${course.name}&app=DC&size=8`;
              const urlDistancia = `https://api.consultoriaeducacao.app.br/offers/v3/showCaseFilter?brand=${brand}&modality=A%20dist%C3%A2ncia&city=${encodeURIComponent(queryCity)}&state=${encodeURIComponent(queryState)}&course=${id}&courseName=${course.name}&app=DC&size=8`;
              const urlSemipresencial = `https://api.consultoriaeducacao.app.br/offers/v3/showCaseFilter?brand=${brand}&modality=Semipresencial&city=${encodeURIComponent(queryCity)}&state=${encodeURIComponent(queryState)}&course=${id}&courseName=${course.name}&app=DC&size=8`;

              try {
                const responses = await Promise.allSettled([
                  axios.get(urlPresencial),
                  axios.get(urlDistancia),
                  axios.get(urlSemipresencial),
                ]);

                const courseData: any = {
                  brand,
                  courseId: id,
                  courseName: course.name,
                };

                if (responses[0].status === "fulfilled") {
                  courseData.presencial = responses[0].value.data;
                }
                if (responses[1].status === "fulfilled") {
                  courseData.distancia = responses[1].value.data;
                }
                if (responses[2].status === "fulfilled") {
                  courseData.semipresencial = responses[2].value.data;
                }

                // Remove modalidades vazias
                Object.keys(courseData).forEach((key) => {
                  if (
                    courseData[key] &&
                    courseData[key].data &&
                    courseData[key].data.length === 0
                  ) {
                    delete courseData[key];
                  }
                });

                if (Object.keys(courseData).length <= 2) {
                  return null;
                }

                if (
                  typeof modalidade === "string" &&
                  ["presencial", "distancia", "semipresencial"].includes(modalidade)
                ) {
                  return {
                    brand,
                    courseId: id,
                    courseName: course.name,
                    [modalidade]: courseData[modalidade] || null,
                  };
                }

                return courseData;
              } catch (error) {
                console.error(`Erro ao buscar dados para o curso ${course.name} (ID: ${id}, Marca: ${brand}):`, error);
                return null;
              }
            })
          );

          const filteredApiRequests = (await Promise.all(apiRequests)).filter((course) => course !== null);
          return filteredApiRequests;
        })
      );

      const filteredResponses = apiResponses.flat().filter((course) => course !== null);

      res.status(200).json({
        courses: filteredResponses,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
        },
      });
    } catch (error) {
      console.error("Erro ao buscar o curso e dados da API externa:", error);
      res.status(500).json({ error: "Erro ao buscar o curso e dados da API externa." });
    }
  } else {
    res.status(405).json({ error: "Método não permitido. Use GET." });
  }
}

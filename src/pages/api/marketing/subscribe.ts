import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import axios from 'axios'

// Configura CORS
const cors = Cors({
  methods: ['POST', 'OPTIONS'],
  origin: '*',
  allowedHeaders: ['Content-Type'],
})

const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result)
      return resolve(result)
    })
  })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const {
    email,
    firstName,
    city,
    state,
    courseId,
    courseName,
    brand,
    modality,
    unitId,
    cpf,
    phone,
    name,
    offerId,
    typeCourse,
    channel,
    cep,
    paid,
  } = req.body

  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório' })
  }

  try {
    const response = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/contacts',
      {
        properties: {
          email,
          firstname: firstName || name,
          phone,
          city,
          state,
          cep,
          cpf,
          brand,
          modality,
          course_id: courseId,
          course_name: courseName,
          unit_id: unitId,
          offer_id: offerId,
          type_course: typeCourse,
          channel,
          paid_status: paid,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return res.status(200).json({ message: 'Lead cadastrado com sucesso!', data: response.data })
  } catch (error: any) {
    const hubspotError = error.response?.data || error.message
    return res.status(500).json({ error: 'Erro ao cadastrar lead no HubSpot', details: hubspotError })
  }
}

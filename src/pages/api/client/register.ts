import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import { sendLeadToHubspot } from '@/lib/hubspot'

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

  try {
    const {
      name,
      email,
      cpf,
      city,
      state,
      courseId,
      courseName,
      brand,
      modality,
      unitId,
      phone,
      offerId,
      typeCourse,
      postal_code,
      channel,
    } = req.body

    if (!name || !email || !cpf) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' })
    }

    const hubspotId = await sendLeadToHubspot({
      email,
      cpf,
      city,
      state,
      courseId,
      courseName,
      brand,
      modality,
      unitId,
      phone,
      name,
      firstName: name,
      offerId,
      typeCourse,
      paid: 'pending',
      cep: postal_code,
      channel,
    })

    return res.status(200).json({
      message: 'Lead enviado para o HubSpot com sucesso!',
      hubspotId,
    })
  } catch (error: any) {
    console.error('Erro ao enviar lead:', error)
    return res.status(500).json({ error: 'Erro ao enviar lead.' })
  }
}

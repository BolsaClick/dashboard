// pages/api/inscricao/index.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { cogna } from '@/lib/axios'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const studentData = req.body // já é o payload montado pelo frontend

    console.log('[DEBUG] Enviando inscrição para Cogna:')
    console.dir(studentData, { depth: null })

    const response = await cogna.post(
      '/candidate/v2/storeCandidateWeb',
      studentData
    )

    return res.status(response.status).json(response.data)
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return res
        .status(error.response?.status || 500)
        .json({ error: error.response?.data || 'Erro desconhecido no parceiro' })
    }

    return res
      .status(500)
      .json({ error: 'Erro ao processar a inscrição', detail: error.message })
  }
}

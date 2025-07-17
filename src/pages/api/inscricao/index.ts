// pages/api/inscricao/index.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { cogna } from '@/lib/axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Libera o CORS para todas as origens (ajuste se necessário)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Responde a requisições OPTIONS (pré-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const studentData = req.body

    console.log('[DEBUG] Enviando inscrição para Cogna:')
    console.dir(studentData, { depth: null })

    const response = await cogna.post('/candidate/v2/storeCandidateWeb', studentData)

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

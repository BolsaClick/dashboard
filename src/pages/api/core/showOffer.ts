// /pages/api/consultoria-offers.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const CONSULTORIA_BASE = 'https://api.consultoriaeducacao.app.br/offers/v3/showCaseFilter'
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*' // ex: "https://meuapp.com,https://outro.com"

function setCorsHeaders(req: NextApiRequest, res: NextApiResponse) {
  const origin = (req.headers.origin as string) || '*'
  const allowed = ALLOWED_ORIGINS.split(',').map((s) => s.trim())

  if (ALLOWED_ORIGINS === '*') {
    res.setHeader('Access-Control-Allow-Origin', '*')
  } else if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
}

/**
 * GET /api/consultoria-offers?brand=...&modality=...&city=...&state=...&course=...&size=...
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // copia dos query params recebidos
    const params: Record<string, any> = { ...req.query }

    // Normaliza modality do query para comparações:
    const rawModality = String(req.query.modality ?? '').replace(/\+/g, ' ').trim().toLowerCase()
    // possíveis variações que queremos considerar
    const enforceAthenasModalities = ['a distância', 'a distancia', 'semipresencial', 'semipresencial ']

    const enforceAthenas = enforceAthenasModalities.includes(rawModality)

    if (enforceAthenas) {
      // força source = ATHENAS tanto na chamada externa quanto no filtro local
      params.source = 'ATHENAS'
    } else {
      // se o cliente enviou source explicitamente, respeitamos (já está em params)
      // caso contrário, não forçamos nada
      if (!req.query.source) {
        delete params.source
      }
    }

    const response = await axios.get(CONSULTORIA_BASE, { params, timeout: 10_000 })
    const originalData: any[] = response.data?.data ?? []

    // Filtragem local:
    let filtered: any[] = originalData

    if (enforceAthenas) {
      filtered = originalData.filter((item) => String(item.source ?? '').toUpperCase() === 'ATHENAS')
    } else if (req.query.source) {
      const requestedSource = String(req.query.source).toUpperCase()
      filtered = originalData.filter((item) => String(item.source ?? '').toUpperCase() === requestedSource)
    } // else mantém originalData sem filtragem por source

    const meta = {
      originalCount: originalData.length,
      filteredCount: filtered.length,
      requestedSize: req.query.size ?? null,
      requestedModality: req.query.modality ?? null,
      requestedSource: req.query.source ?? (enforceAthenas ? 'ATHENAS (forçado)' : null),
      after: response.data?.after ?? null
    }

    return res.status(200).json({
      data: filtered,
      meta,
      fetchedAt: new Date().toISOString()
    })
  } catch (err: any) {
    console.error('Erro ao consultar Consultoria Educação:', err.response?.data ?? err.message)
    const message = err.response?.data ?? err.message ?? 'Erro desconhecido'
    return res.status(500).json({ error: 'Erro ao buscar ofertas', detail: message })
  }
}
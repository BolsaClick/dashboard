// /pages/api/offer.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const ELASTICSEARCH_URL = process.env.DMH_URL || ''
const ELASTICSEARCH_APIKEY = process.env.ELASTICSEARCH_APIKEY || ''
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*'

function setCorsHeaders(req: NextApiRequest, res: NextApiResponse) {
  const origin = (req.headers.origin as string) || '*'
  const allowed = ALLOWED_ORIGINS === '*' ? ['*'] : ALLOWED_ORIGINS.split(',').map(s => s.trim())

  if (ALLOWED_ORIGINS === '*' || allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS === '*' ? '*' : origin)
    if (ALLOWED_ORIGINS !== '*') res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { businessOfferKey, source = 'ATHENAS', salesChannelKey = '98' } = req.query

  if (!businessOfferKey || typeof businessOfferKey !== 'string') {
    return res.status(400).json({ error: 'businessOfferKey é obrigatório e deve ser string' })
  }

  const query = {
    query: {
      bool: {
        must: [
          { term: { 'businessKey.keyword': businessOfferKey } },
          { term: { 'source.keyword': source } },
          { term: { 'salesChannels.businessKey.keyword': salesChannelKey } },
          { term: { recordActive: true } },
          { range: { validFrom: { lte: 'now-3h/m' } } },
          { range: { expiredAt: { gte: 'now/h' } } }
        ]
      }
    }
  }

  try {
    const response = await axios.post(
      `${ELASTICSEARCH_URL}/business-offer-all/_search`,
      query,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `ApiKey ${ELASTICSEARCH_APIKEY}`
        }
      }
    )

    const es = response.data
    const hits = es.hits?.hits || []

    const formatted = hits.map((hit: any) => {
      const source = hit._source || {}

      const address = source.accountTeachingInstitution?.address
      const endereco = address
        ? `${address.mailingStreet || ''}, ${address.number || ''} - ${address.district || ''}, ${address.mailingCity || ''} - ${address.mailingState || ''}, CEP: ${address.mailingPostalCode || ''}`
        : null

      return {
        id: hit._id,
        courseName: source.name || null,
        brand: source.accountTeachingInstitution?.brandName || null,
        endereco,
        modalidade: source.modality || null,
      }
    })

    const meta = {
      took: es.took,
      timed_out: es.timed_out,
      total: es.hits?.total?.value ?? 0,
      max_score: es.hits?.max_score ?? null
    }

    return res.status(200).json({
      data: formatted,
      meta,
      fetchedAt: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Erro na busca Elasticsearch:', error.response?.data || error.message)
    return res.status(500).json({ error: 'Erro na busca Elasticsearch' })
  }
}
// pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt' // opcional: instalar bcrypt para hash de senhas

// Inicializa CORS para permitir todas origens
const cors = Cors({
  methods: ['POST', 'OPTIONS'],
  origin: '*', // libera qualquer origem (CUIDADO: produção, defina o domínio permitido)
})

// Helper para rodar middleware em Next.js
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result)
      return resolve(result)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // roda CORS
  await runMiddleware(req, res, cors)

  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, password, cpf, ...rest } = req.body

  if (!name || !email || !password || !cpf) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' })
  }

  try {
    // 1) busca por CPF e por EMAIL (campos únicos)
    const [byCpf, byEmail] = await Promise.all([
      prisma.userStudent.findUnique({ where: { cpf } }),
      prisma.userStudent.findUnique({ where: { email } }),
    ])

    if (byCpf) {
      return res.status(200).json({ existed: true, reason: 'cpf', userId: byCpf.id })
    }

    if (byEmail) {
      return res.status(200).json({ existed: true, reason: 'email', userId: byEmail.id })
    }

    // 2) hash da senha (recomendado)
    // const saltRounds = 10
    // const hashedPassword = await bcrypt.hash(password, saltRounds)

    const user = await prisma.userStudent.create({
      data: {
        name,
        email,
        password, // substitua por hashedPassword se fizer hashing
        cpf,
        ...rest,
      },
      select: { id: true },
    })

    return res.status(201).json({ existed: false, userId: user.id })
  } catch (error: any) {
    // 3) proteção contra condição de corrida (P2002: unique constraint)
    if (error?.code === 'P2002') {
      const target = Array.isArray(error?.meta?.target) ? error.meta.target[0] : null

      try {
        if (target === 'cpf') {
          const u = await prisma.userStudent.findUnique({ where: { cpf } })
          if (u) return res.status(200).json({ existed: true, reason: 'cpf', userId: u.id })
        } else if (target === 'email') {
          const u = await prisma.userStudent.findUnique({ where: { email } })
          if (u) return res.status(200).json({ existed: true, reason: 'email', userId: u.id })
        } else {
          const uCpf = await prisma.userStudent.findUnique({ where: { cpf } })
          if (uCpf) return res.status(200).json({ existed: true, reason: 'cpf', userId: uCpf.id })
          const uEmail = await prisma.userStudent.findUnique({ where: { email } })
          if (uEmail) return res.status(200).json({ existed: true, reason: 'email', userId: uEmail.id })
        }
      } catch (e) {
        console.error('[CREATE_USER_RACE_RETRY_ERROR]', e)
      }

      return res.status(409).json({ error: 'Conflito de criação (cpf/email já criado)' })
    }

    console.error('[CREATE_USER_ERROR]', error)
    return res.status(500).json({ error: 'Erro interno' })
  }
}

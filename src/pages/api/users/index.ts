// pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt' // opcional para hash de senha

// Inicializa CORS
const cors = Cors({
  methods: ['GET', 'POST', 'OPTIONS'],
  origin: '*',
})

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result)
      return resolve(result)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors)

  // 🔹 GET → listar ou buscar por ID/CPF
  if (req.method === 'GET') {
    try {
      const { id, cpf } = req.query

      if (id) {
        const user = await prisma.userStudent.findUnique({
          where: { id: String(id) },
          select: { id: true, name: true, email: true, cpf: true, createdAt: true },
        })
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
        return res.status(200).json(user)
      }

      if (cpf) {
        const user = await prisma.userStudent.findUnique({
          where: { cpf: String(cpf) },
          select: { id: true, name: true, email: true, cpf: true, createdAt: true },
        })
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
        return res.status(200).json(user)
      }

      // Se não passar filtro, lista todos
      const users = await prisma.userStudent.findMany({
        select: { id: true, name: true, email: true, cpf: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      })

      return res.status(200).json(users)
    } catch (err) {
      console.error('[GET_USERS_ERROR]', err)
      return res.status(500).json({ error: 'Erro ao buscar usuários' })
    }
  }

  // 🔹 POST → criar usuário
  if (req.method === 'POST') {
    const { name, email, password, cpf, ...rest } = req.body

    if (!name || !email || !password || !cpf) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' })
    }

    try {
      // verifica se já existe
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

      // opcional: hash da senha
      // const saltRounds = 10
      // const hashedPassword = await bcrypt.hash(password, saltRounds)

      const user = await prisma.userStudent.create({
        data: {
          name,
          email,
          password, // ou hashedPassword
          cpf,
          ...rest,
        },
        select: { id: true, name: true, email: true, cpf: true },
      })

      return res.status(201).json({ existed: false, userId: user.id, user })
    } catch (error: any) {
      if (error?.code === 'P2002') {
        return res.status(409).json({ error: 'Conflito de criação (cpf/email já criado)' })
      }

      console.error('[CREATE_USER_ERROR]', error)
      return res.status(500).json({ error: 'Erro interno' })
    }
  }

  // 🔹 Outros métodos não permitidos
  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS'])
  return res.status(405).end(`Método ${req.method} não permitido.`)
}

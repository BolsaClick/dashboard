import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, password, cpf, ...rest } = req.body

  if (!name || !email || !password || !cpf) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' })
  }

  try {
    const existingUser = await prisma.userStudent.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ error: 'Usuário já cadastrado' })
    }

    const user = await prisma.userStudent.create({
      data: {
        name,
        email,
        password, // ideal: hash antes de salvar
        cpf,
        ...rest,
      },
    })

    return res.status(201).json({ userId: user.id })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
// pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt' // opcional: instale bcrypt se quiser hashear senhas

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    // 2) hash da senha (recomendado) - opcional, descomente se instalar bcrypt
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
      // identifica qual campo causou o erro (meta.target pode existir)
      const target = Array.isArray(error?.meta?.target) ? error.meta.target[0] : null

      // tenta buscar o usuário pelo CPF/email novamente (caso tenha sido criado por outro request)
      try {
        if (target === 'cpf') {
          const u = await prisma.userStudent.findUnique({ where: { cpf } })
          if (u) return res.status(200).json({ existed: true, reason: 'cpf', userId: u.id })
        } else if (target === 'email') {
          const u = await prisma.userStudent.findUnique({ where: { email } })
          if (u) return res.status(200).json({ existed: true, reason: 'email', userId: u.id })
        } else {
          // fallback: tentar encontrar por cpf ou email
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
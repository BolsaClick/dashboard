import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import { sendLeadToHubspot, HubspotLeadPayload } from '@/lib/hubspot'

const prisma = new PrismaClient()

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
      password,
      cpf,
      document,
      birthday,
      address,
      address_number,
      neighborhood,
      city,
      state,
      postal_code,
      phone,
      whatsapp_optin,
      high_school_completion_year,
      universitySlugs,
      courseId,
      courseName,
      amount,
      brand,
      modality,
      unitId,
      offerId,
      typeCourse,
      channel,
    } = req.body

    if (!name || !email || !cpf || amount === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' })
    }

    const universities = await prisma.university.findMany({
      where: { slug: { in: universitySlugs } },
      select: { id: true },
    })

    if (universities.length === 0) {
      return res.status(404).json({ error: 'Universidade não encontrada.' })
    }

    // 🔍 Verifica se já existe o usuário
    const existingUser = await prisma.userStudent.findFirst({
      where: {
        OR: [{ email }, { cpf }],
      },
      include: { universities: true },
    })

    // 🔁 Envia os dados para o HubSpot (mesmo se já existir o usuário)
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

    if (existingUser) {
      // Cria nova transação para o usuário já existente
      const transaction = await prisma.transaction.create({
        data: {
          userId: existingUser.id,
          amount,
          status: 'pending',
        },
      })

      return res.status(200).json({
        message: 'Usuário já existente. Transação criada.',
        user: existingUser,
        transaction,
      })
    }

    // 🔐 Criptografa senha (ou gera padrão)
    const finalPassword = password || generateDefaultPassword()
    const hashedPassword = await bcrypt.hash(finalPassword, 10)

    // 🧑‍🎓 Cria novo usuário
    const newUser = await prisma.userStudent.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cpf,
        document,
        birthday: new Date(birthday),
        address,
        address_number,
        neighborhood,
        city,
        state,
        postal_code,
        phone,
        whatsapp_optin,
        high_school_completion_year,
        courseId,
        courseName,
        hubspotContactId: hubspotId,
        universities: {
          connect: universities.map((u) => ({ id: u.id })),
        },
      },
      include: { universities: true },
    })

    // 💸 Cria transação
    const transaction = await prisma.transaction.create({
      data: {
        userId: newUser.id,
        amount,
        status: 'pending',
      },
    })

    return res.status(200).json({
      message: 'Usuário e lead criados com sucesso!',
      user: newUser,
      transaction,
    })
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error)
    return res.status(500).json({ error: 'Erro no registro.' })
  }
}

function generateDefaultPassword(length = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length })
    .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
    .join('')
}

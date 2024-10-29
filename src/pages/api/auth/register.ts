import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, password } = req.body;

    try {
      // Verificar se todos os campos obrigatórios estão presentes
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
      }

      // Verificar se o usuário já existe
      const existingUserAdmin = await prisma.userAdmin.findUnique({
        where: { email },
      });

      if (existingUserAdmin) {
        return res.status(400).json({ error: 'E-mail já cadastrado como administrador.' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar o usuário admin
      const userAdmin = await prisma.userAdmin.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      return res.status(201).json({ message: 'Usuario registrado com sucesso!', userAdmin });
    } catch (error) {
      console.error('Erro ao registrar usuario:', error);
      return res.status(500).json({ error: 'Erro ao registrar Usuario.' });
    }
  } else {
    // Método não permitido
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}

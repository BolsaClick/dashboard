import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido. Use POST.' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  const userStudent = await prisma.userStudent.findUnique({ where: { email } });

  if (!userStudent) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const isPasswordValid = await bcrypt.compare(password, userStudent.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  return res.status(200).json({
    id: userStudent.id,
    name: userStudent.name,
    email: userStudent.email,
  
  });
};

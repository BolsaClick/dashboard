import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { token, newPassword } = req.body;

    try {
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
      });

      if (!resetToken || resetToken.expiresAt < new Date()) {
        return res.status(400).json({ error: 'Token inválido ou expirado.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.userStudent.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });

      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
    } catch (error) {
      console.error('Erro ao redefinir a senha:', error);
      return res.status(500).json({ error: 'Erro ao redefinir a senha.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}

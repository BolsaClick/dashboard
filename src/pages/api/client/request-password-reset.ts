import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

import { v4 as uuidv4 } from 'uuid';
import { passwordResetEmailTemplate } from '@/emails/resetpassword';
import transporter from '@/lib/mail';

const prisma = new PrismaClient();



async function sendResetEmail(email: string, name: string, token: string) {
  const htmlTemplate = passwordResetEmailTemplate(name, token);

  const mailOptions = {
    from: 'no-reply@bolsaclick.com.br',
    to: email,
    subject: 'Redefinição de Senha',
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
      const user = await prisma.userStudent.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 3600000); 

      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });

     
      await sendResetEmail(email, user.name, token); 

      return res.status(200).json({ message: 'Email de redefinição de senha enviado.' });
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      return res.status(500).json({ error: 'Erro ao solicitar redefinição de senha.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}

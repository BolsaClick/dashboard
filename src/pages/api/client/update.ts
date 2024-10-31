import transporter from '@/lib/mail';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';

const prisma = new PrismaClient();

const cors = Cors({
  methods: ['PATCH', 'OPTIONS'], 
  origin: '*', 
  allowedHeaders: ['Content-Type'], 
});

const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors); 

  if (req.method === 'PATCH') {
    const { userId, newEmail, newName } = req.body;

    try {
      if (!userId || !newEmail || !newName) {
        return res.status(400).json({ error: 'ID do usuário, novo e-mail e novo nome são obrigatórios.' });
      }

      const existingUser = await prisma.userStudent.findUnique({
        where: { email: newEmail },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'E-mail já cadastrado.' });
      }

      const updatedUser = await prisma.userStudent.update({
        where: { id: userId },
        data: { email: newEmail, name: newName },
      });

      
      const mailOptions = {
        from: 'no-reply@bolsaclick.com.br',
        to: newEmail,
        subject: 'E-mail e nome atualizados com sucesso',
        html: `<p>Olá, ${newName},</p>
               <p>Seu e-mail foi atualizado com sucesso para <strong>${newEmail}</strong> e seu nome para <strong>${newName}</strong>.</p>
               <p>Se você não solicitou essa alteração, entre em contato conosco imediatamente.</p>`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: 'E-mail e nome atualizados com sucesso!', user: updatedUser });
    } catch (error) {
      console.error('Erro ao atualizar e-mail e nome:', error);
      return res.status(500).json({ error: 'Erro ao atualizar e-mail e nome.' });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}

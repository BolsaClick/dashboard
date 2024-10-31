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
      if (!userId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
      }

      // Buscar o usuário existente
      const existingUser = await prisma.userStudent.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      // Verificar se o novo e-mail já está em uso
      if (newEmail) {
        const emailExists = await prisma.userStudent.findUnique({
          where: { email: newEmail },
        });

        if (emailExists) {
          return res.status(400).json({ error: 'E-mail já cadastrado.' });
        }
      }

      // Preparar os dados para atualização
      const updateData: any = {};
      if (newEmail) updateData.email = newEmail;
      if (newName) updateData.name = newName;

      // Atualizar o usuário
      const updatedUser = await prisma.userStudent.update({
        where: { id: userId },
        data: updateData,
      });

      // Enviar e-mail de confirmação apenas se o nome ou o e-mail foram alterados
      if (newEmail || newName) {
        const mailOptions = {
          from: 'no-reply@bolsaclick.com.br',
          to: newEmail || existingUser.email,
          subject: 'Atualização de Cadastro',
          html: `<p>Olá, ${newName || existingUser.name},</p>
                 <p>Seu cadastro foi atualizado com sucesso.</p>
                 ${newEmail ? `<p>Seu novo e-mail é: <strong>${newEmail}</strong>.</p>` : ''}
                 ${newName ? `<p>Seu novo nome é: <strong>${newName}</strong>.</p>` : ''}
                 <p>Se você não solicitou essa alteração, entre em contato conosco imediatamente.</p>`,
        };

        await transporter.sendMail(mailOptions);
      }

      return res.status(200).json({ message: 'E-mail e/ou nome atualizados com sucesso!', user: updatedUser });
    } catch (error) {
      console.error('Erro ao atualizar e-mail e nome:', error);
      return res.status(500).json({ error: 'Erro ao atualizar e-mail e nome.' });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}

import { createAccountDashboard } from '@/emails/createAccountDashboard';
import transporter from '@/lib/mail';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid'; // Importar UUID

const prisma = new PrismaClient();

interface UserRegistrationData {
  name: string;
  email: string;
  password?: string;
  cpf: string;
  document: string;
  birthday: string;
  address: string;
  address_number: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  whatsapp_optin: boolean;
  high_school_completion_year: string;
  universitySlugs: string[];
  courseId: string;
  courseName: string;
}

// Função para enviar email de confirmação de cadastro
async function sendPasswordEmail(email: string, password: string, name: string, token: string) {
  const htmlTemplate = createAccountDashboard(password, name, token);

  const mailOptions = {
    from: 'no-reply@bolsaclick.com.br',
    to: email,
    subject: 'Cadastro realizado com sucesso',
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
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
    }: UserRegistrationData = req.body;

    try {
      if (!name || !email || !cpf) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
      }

     
      const existingUser = await prisma.userStudent.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'E-mail já cadastrado.' });
      }

      const finalPassword = password || generateDefaultPassword();
      const hashedPassword = await bcrypt.hash(finalPassword, 10);

      const universities = await prisma.university.findMany({
        where: {
          slug: {
            in: universitySlugs,
          },
        },
        select: {
          id: true,
        },
      });

      if (universities.length === 0) {
        return res.status(404).json({ error: 'Nenhuma universidade encontrada com os slugs fornecidos.' });
      }

   
      const user = await prisma.userStudent.create({
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
          universities: {
            connect: universities.map((university) => ({ id: university.id })),
          },
        },
        include: {
          universities: true,
        },
      });

      const token = uuidv4(); 

      await sendPasswordEmail(email, finalPassword, name, token); 

      return res.status(201).json({ message: 'Usuário registrado com sucesso!', user });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return res.status(500).json({ error: 'Erro ao registrar usuário.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}

// Função para gerar uma senha padrão
function generateDefaultPassword(length = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return password;
}

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios.');
        }

        const userAdmin = await prisma.userAdmin.findUnique({
          where: { email: credentials.email },
        });

        const userStudent = await prisma.userStudent.findUnique({
          where: { email: credentials.email },
        });

        let user;
        if (userAdmin) {
          const isPasswordValid = await bcrypt.compare(credentials.password, userAdmin.password);
          if (!isPasswordValid) {
            throw new Error('Credenciais inválidas.');
          }
          user = { ...userAdmin, role: 'ADMIN' };
        } else if (userStudent) {
          const isPasswordValid = await bcrypt.compare(credentials.password, userStudent.password);
          if (!isPasswordValid) {
            throw new Error('Credenciais inválidas.');
          }
          user = { ...userStudent, role: 'STUDENT' };
        } else {
          throw new Error('Credenciais inválidas.');
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 dia
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
});

import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 🔹 Configuração CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { code, type, discount, validUntil, maxUses } = req.body;

      if (!code || !type || !discount) {
        return res.status(400).json({ error: "Campos obrigatórios: code, type, discount" });
      }

      const coupon = await prisma.coupon.create({
        data: {
          code,
          type, // "PERCENT" ou "FIXED"
          discount, // já em centavos (% inteiro ou valor fixo em centavos)
          validUntil: validUntil ? new Date(validUntil) : null,
          maxUses: maxUses ?? null,
          usedCount: 0,
        },
      });

      return res.status(201).json(coupon);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
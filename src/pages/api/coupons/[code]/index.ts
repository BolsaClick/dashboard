import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 🔹 Configuração CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { code } = req.query;
    const { amountInCents } = req.body; // 💰 trabalhar sempre em centavos!

    if (!amountInCents) {
      return res.status(400).json({ error: "É necessário enviar amountInCents" });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: String(code) },
    });

    if (!coupon) return res.status(404).json({ error: "Cupom não encontrado" });
    if (coupon.validUntil && new Date() > coupon.validUntil) {
      return res.status(400).json({ error: "Cupom expirado" });
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ error: "Limite de usos atingido" });
    }

    let finalAmount = amountInCents;
    if (coupon.type === "PERCENT") {
      finalAmount = amountInCents - Math.floor(amountInCents * (coupon.discount / 100));
    } else if (coupon.type === "FIXED") {
      finalAmount = Math.max(0, amountInCents - coupon.discount); // FIXED já em centavos
    }

    return res.status(200).json({
      coupon: coupon.code,
      originalAmount: amountInCents,
      finalAmount,
      discountApplied: amountInCents - finalAmount,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
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
    const { amountInCents } = req.body;

    if (!amountInCents) {
      return res.status(400).json({ error: "É necessário enviar amountInCents" });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: String(code).toUpperCase() },
    });

    if (!coupon) {
      return res.status(404).json({ error: "Cupom não encontrado" });
    }

    if (coupon.validUntil && new Date() > coupon.validUntil) {
      return res.status(400).json({ error: "Cupom expirado", expiresAt: coupon.validUntil });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({
        error: "Limite de usos atingido",
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount,
      });
    }

    // 🔹 Calcula apenas para RETORNO ao front
    let finalAmount = amountInCents;

    if (coupon.type === "PERCENT") {
      // desconto percentual → já salvo direto (10 significa 10%)
      finalAmount = amountInCents - Math.floor(amountInCents * (coupon.discount / 100));
    } else if (coupon.type === "FIXED") {
      // desconto fixo → valor em centavos
      finalAmount = Math.max(0, amountInCents - coupon.discount);
    }

    return res.status(200).json({
      valid: true,
      coupon: coupon.code,
      type: coupon.type,
      originalAmount: amountInCents,
      finalAmount,
      discountApplied: amountInCents - finalAmount,
      expiresAt: coupon.validUntil,
      maxUses: coupon.maxUses,
      usedCount: coupon.usedCount,
    });
  } catch (error: any) {
    console.error("Erro ao aplicar cupom:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
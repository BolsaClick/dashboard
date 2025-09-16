// pages/api/abacate/webhook/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

const ABACATE_SECRET = process.env.WEBHOOK_SECRET || "@Murilo2016";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // validar secret via query ou header
  const receivedSecret =
    (req.headers["x-abacatepay-secret"] as string) || req.query.webhookSecret;
  if (receivedSecret !== ABACATE_SECRET) {
    console.warn("[WEBHOOK] Secret inválido:", receivedSecret);
    return res.status(401).json({ error: "Invalid webhook secret" });
  }

  try {
    const payload = req.body;
    const event = payload?.event;
    const data = payload?.data;

    console.log("[ABACATEPAY WEBHOOK RECEIVED]", JSON.stringify(payload, null, 2));

    // Só processamos billing.paid
    if (event !== "billing.paid") {
      return res.status(200).json({ received: true, ignored: true });
    }

    // Extrair transactionId e status
    const pixQrCode = data?.pixQrCode;
    const transactionId = pixQrCode?.metadata?.transactionId;
    const status = pixQrCode?.status?.toUpperCase();

    if (!transactionId) {
      console.error("[WEBHOOK] transactionId ausente");
      return res.status(400).json({ error: "transactionId ausente" });
    }

    if (status === "PAID") {
      // Atualiza a transação no banco
      const trx = await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "paid" },
      });
      console.log(`[WEBHOOK] Transação atualizada para paid: ${trx.id}`);
      return res.status(200).json({ received: true, updated: true, transactionId: trx.id });
    }

    console.log(`[WEBHOOK] Evento recebido, mas status não é PAID: ${status}`);
    return res.status(200).json({ received: true, updated: false, status });
  } catch (err: any) {
    console.error("[WEBHOOK_ERROR]", err);
    return res.status(500).json({ error: "Internal server error", details: err?.message ?? err });
  }
}

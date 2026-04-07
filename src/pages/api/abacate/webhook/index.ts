// pages/api/abacate/webhook/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { createEnrollment as createCognaEnrollment } from "@/lib/services/cognaService";
import { createEnrollment as createKrotonEnrollment } from "@/lib/services/krotonService";
import { notifyPayment } from "../../socketio";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "@Murilo2016";

// ----------------------
// Notificação no Discord
// ----------------------
async function notifyDiscord(source: string, details: any, success = true) {
  if (!DISCORD_WEBHOOK_URL) return;

  const { offerId, courseId, name, cpf, email, phone, response, error } = details;
  const emoji = success ? "✅" : "❌";
  const statusMsg = success ? "SUCESSO" : "ERRO";

  const msg = {
    content: `${emoji} **Inscrição - ${source.toUpperCase()} (${statusMsg})**
**OfferId:** ${offerId ?? "N/A"}
**CourseId:** ${courseId ?? "N/A"}
**Nome:** ${name ?? "N/A"}
**CPF:** ${cpf ?? "N/A"}
**Email:** ${email ?? "N/A"}
**Telefone:** ${phone ?? "N/A"}

${
  success
    ? `**Resposta:** \`\`\`json\n${JSON.stringify(response, null, 2).slice(0, 1200)}\n\`\`\``
    : `**Erro:** \`\`\`json\n${JSON.stringify(error, null, 2).slice(0, 1200)}\n\`\`\``
}`,
  };

  try {
    await axios.post(DISCORD_WEBHOOK_URL, msg);
  } catch (err) {
    console.error("[DiscordNotifier] Falha ao enviar:", err);
  }
}

// ----------------------
// Processador idempotente
// ----------------------
async function processEnrollment({
  trx,
  source,
  payload,
  serviceFn,
  metadata,
  common,
}: {
  trx: any;
  source: "cogna" | "kroton";
  payload: any;
  serviceFn: (data: any) => Promise<any>;
  metadata: any;
  common: any;
}) {
  const existing = await prisma.enrollment.findFirst({
    where: { transactionId: trx.id, source },
  });

  if (existing?.status === "ENROLLED" && existing.enrolled) {
    console.log(`⚠️ ${source} já está ENROLLED, pulando...`);
    return { skipped: true };
  }

  try {
    console.log(`[${source}] Enviando inscrição...`);
    const resp = await serviceFn(payload);

    if (existing) {
      await prisma.enrollment.update({
        where: { id: existing.id },
        data: {
          enrolled: true,
          status: "ENROLLED",
          response: resp,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.enrollment.create({
        data: {
          userId: metadata.userId ?? trx.userId,
          transactionId: trx.id,
          source,
          offerId:
            source === "cogna"
              ? common.offerId
              : metadata.idDMH ??
                payload?.inscricao?.ofertas?.primeiraOpcao?.idDMH ??
                common.offerId,
          courseId: common.courseId,
          brand: metadata.brand ?? null,
          promoterId: source === "cogna" ? metadata.promoterIdCogna : null,
          idSalesChannel:
            source === "cogna"
              ? metadata.idSalesChannelCogna
              : metadata.idSalesChannelKroton,
          canal: "web",
          externalData: payload,
          response: resp,
          enrolled: true,
          status: "ENROLLED",
        },
      });
    }

    await notifyDiscord(source, { ...common, response: resp }, true);
    console.log(`🎉 ${source} inscrição salva e enviada com sucesso`);
    return { success: true, response: resp };
  } catch (err: any) {
    console.error(`❌ Erro ao enviar inscrição para ${source}:`, err.response?.data || err.message);

    if (existing) {
      await prisma.enrollment.update({
        where: { id: existing.id },
        data: {
          enrolled: false,
          status: "ERROR",
          response: err.response?.data || { message: err.message },
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.enrollment.create({
        data: {
          userId: metadata.userId ?? trx.userId,
          transactionId: trx.id,
          source,
          offerId:
            source === "cogna"
              ? common.offerId
              : metadata.idDMH ??
                payload?.inscricao?.ofertas?.primeiraOpcao?.idDMH ??
                common.offerId,
          courseId: common.courseId,
          brand: metadata.brand ?? null,
          promoterId: source === "cogna" ? metadata.promoterIdCogna : null,
          idSalesChannel:
            source === "cogna"
              ? metadata.idSalesChannelCogna
              : metadata.idSalesChannelKroton,
          canal: "web",
          externalData: payload,
          response: err.response?.data || { message: err.message },
          enrolled: false,
          status: "ERROR",
        },
      });
    }

    await notifyDiscord(source, { ...common, error: err.response?.data || err.message }, false);
    return { success: false, error: err.response?.data || err.message };
  }
}

// ----------------------
// Handler principal
// ----------------------
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // validação do secret
    const receivedSecret =
      (req.headers["x-abacatepay-secret"] as string) || req.query.webhookSecret;
    if (receivedSecret !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: "Invalid webhook secret" });
    }

    const payload = req.body;
    console.log("[ABACATEPAY WEBHOOK RECEIVED]", JSON.stringify(payload, null, 2));

    if (payload?.event !== "billing.paid") {
      return res.status(200).json({ received: true, ignored: true });
    }

    const pixQrCode = payload?.data?.pixQrCode;
    const metadata = pixQrCode?.metadata || {};
    const transactionId = metadata?.transactionId;
    const status = (pixQrCode?.status || "").toUpperCase();

    if (!transactionId) return res.status(400).json({ error: "transactionId ausente" });
    if (status !== "PAID") return res.status(200).json({ received: true, ignored: true, status });

    // Atualiza transação
    const trx = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: "paid" },
    });
    console.log(`✅ Transação ${trx.id} atualizada para PAID.`);

    // 🔹 Notifica via Socket.IO
    notifyPayment(transactionId, "paid");

    const common = {
      offerId:
        metadata.offerId ??
        metadata?.cognaPayload?.inscricao?.courseOffer?.offerId ??
        metadata.idDMH,
      courseId: metadata.courseId ?? metadata.planId,
      name:
        metadata?.cognaPayload?.dadosPessoais?.nome ??
        metadata?.athenasPayload?.dadosPessoais?.nome,
      cpf:
        metadata?.cognaPayload?.dadosPessoais?.cpf ??
        metadata?.athenasPayload?.dadosPessoais?.cpf,
      email:
        metadata?.cognaPayload?.dadosPessoais?.email ??
        metadata?.athenasPayload?.dadosPessoais?.email,
      phone:
        metadata?.cognaPayload?.dadosPessoais?.celular ??
        metadata?.athenasPayload?.dadosPessoais?.celular,
    };

    const results: any = {};

    // Processa Cogna
    if (metadata.cognaPayload) {
      results.cogna = await processEnrollment({
        trx,
        source: "cogna",
        payload: metadata.cognaPayload,
        serviceFn: createCognaEnrollment,
        metadata,
        common,
      });
    }

    // Processa Kroton
    if (metadata.athenasPayload) {
      results.kroton = await processEnrollment({
        trx,
        source: "kroton",
        payload: metadata.athenasPayload,
        serviceFn: createKrotonEnrollment,
        metadata,
        common,
      });
    }

    return res.status(200).json({
      received: true,
      transactionId: trx.id,
      results,
    });
  } catch (err: any) {
    console.error("[WEBHOOK_ERROR]", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}

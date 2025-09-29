// pages/api/abacate/checkout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import AbacatePay from "abacatepay-nodejs-sdk";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const abacateKey = process.env.ABACATEPAY_API_KEY;
  const promoterIdCogna = process.env.COGNA_PROMOTER_ID || "6716698cb4d33b0008a18001";

  if (!abacateKey) {
    console.error("[CREATE_CHECKOUT] AbacatePay key missing");
    return res.status(500).json({ error: "API key não configurada" });
  }

  const abacate = AbacatePay(`${abacateKey}`);

  try {
    const body = req.body;
    const {
      nome,
      cpf,
      rg,
      dataNascimento,
      email,
      telefone,
      endereco,
      numero,
      bairro,
      cidade,
      estado,
      cep,
      anoConclusao,
      offerId,   // Cogna
      idDMH,     // Kroton
      brand,
      degree,
      type,
      planId,
      couponCode,
      amountInCents,
    } = body;

    if (!nome || !cpf || !email || !telefone || !planId) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    // 🔹 1) Cria/valida usuário
    let user = await prisma.userStudent.findUnique({ where: { cpf } });
    if (!user) {
      user = await prisma.userStudent.create({
        data: {
          name: nome,
          email,
          cpf,
          password: Math.random().toString(36).slice(-8),
          phone: telefone,
        },
      });
    }

    // 🔹 2) Formatando datas
    const birthDateForCogna = dataNascimento ? format(new Date(dataNascimento), "dd/MM/yyyy") : null;
    const birthDateForKroton = dataNascimento ? format(new Date(dataNascimento), "yyyy-MM-dd") : null;

    // 🔹 3) Payload Cogna
    const cognaPayload = {
      dadosPessoais: {
        nome,
        cpf,
        rg,
        sexo: "M",
        celular: telefone,
        dataNascimento: birthDateForCogna,
        email,
        endereco: {
          logradouro: endereco,
          numero,
          bairro,
          cep,
          uf: estado,
          municipio: cidade,
        },
      },
      inscricao: {
        aceiteTermo: true,
        anoConclusao: Number(anoConclusao),
        enem: { isUsed: false },
        receberEmail: true,
        receberSMS: true,
        receberWhatsApp: true,
        courseOffer: {
          offerId,
          brand,
          degree,
          id: offerId,
          type,
        },
      },
      promoterId: promoterIdCogna,
      idSalesChannel: 88, // 🔹 fixo para Cogna
      canal: "web",
    };

    // 🔹 4) Payload Kroton
    const athenasPayload = {
      inscricao: {
        enem: { utilizar: true, protocolo: "171" },
        anoConclusao: Number(anoConclusao),
        aceiteTermo: true,
        aceitaReceberEmail: true,
        aceitaReceberSMS: true,
        aceitaReceberWhatsApp: true,
        ofertas: { primeiraOpcao: { idDMH } },
        canalVendas: { id: 98 }, // 🔹 fixo para Kroton
        idTipoProva: 2,
      },
      dadosPessoais: {
        nome,
        cpf,
        sexo: "M",
        rg,
        dataNascimento: birthDateForKroton,
        email,
        celular: telefone,
        endereco: {
          logradouro: endereco,
          numero,
          bairro,
          cep,
          uf: estado,
          municipio: cidade,
        },
      },
    };

    const metadata = {
      userId: user.id,
      brand,
      courseId: planId,
      offerId,                 // Cogna
      idDMH,                   // Kroton
      promoterIdCogna,         // 🔹 sempre enviado
      idSalesChannelCogna: 88,
      idSalesChannelKroton: 98,
      canal: "web",
      cognaPayload,
      athenasPayload,
    };

    // 🔹 5) Cria transação
    let transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: amountInCents,
        status: "pending",
        couponId: null,
        metadata,
      },
    });

    // Cupom
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (!coupon) return res.status(404).json({ error: "Cupom não encontrado" });
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ error: "Limite de usos atingido" });
      }

      transaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: { couponId: coupon.id },
      });
    }

    // 🔹 6) Payload para AbacatePay
    const providerPayload = {
      amount: amountInCents,
      description: `Matrícula - ${brand}`,
      expiresIn: 3600,
      customer: {
        name: nome,
        email,
        cellphone: telefone,
        taxId: cpf,
      },
      metadata: {
        transactionId: transaction.id,
        ...metadata,
      },
    };

    const billing = await abacate.pixQrCode.create(providerPayload as any);

    if (!billing) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "error" },
      });
      return res.status(502).json({ error: "Erro no provider" });
    }

    return res.status(200).json({
      success: true,
      transactionId: transaction.id,
      pixQrCode: billing,
      sentPayload: { customer: providerPayload.customer, metadata },
    });
  } catch (err: any) {
    console.error("[CREATE_CHECKOUT_ERROR]", err);
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
}

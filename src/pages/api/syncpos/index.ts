// /pages/api/leads/backgroundPos.ts
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  runtime: "nodejs",
  background: true,
};

// IDs de ofertas da PÓS (exemplo)
const offerIds = [
  "6566024",
  "6566190",
  "10490204",
  "15751318",
  "10490331",
  "6972888",
  "6972543",
];
const paymentPlans = [
  "596575381",
  "596575713",
  "597053671",
  "598394933",
  "597053831",
];

// Função para normalizar cpf
const normalizeCpf = (cpf: any) =>
  cpf?.toString().replace(/\D/g, "").padStart(11, "0");

// ✅ Nova função usando API consultoriaeducacao
async function getAddressByCep(cep: string) {
  try {
    const cleanCep = (cep ?? "").toString().replace(/\D/g, "");

    const { data } = await axios.get(
      `https://api.consultoriaeducacao.app.br/user/cep?search=${cleanCep}`
    );

    if (data.error) return null;

    return {
      bairro: data.data.neighborhood,
      cep: data.data.cep,
      complemento: "",
      logradouro: data.data.street,
      municipio: data.data.city,
      numero: 1,
      uf: data.data.state,
    };
  } catch (error) {
    console.log("❌ Erro ao buscar CEP:", error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let leads = req.body;

  if (Array.isArray(leads) && leads.length === 1 && leads[0]?.leads)
    leads = leads[0].leads;
  else if (!Array.isArray(leads) && leads?.leads) leads = leads.leads;

  if (!Array.isArray(leads)) {
    return res.status(400).json({
      error: "Formato inválido — esperado { leads: [] }",
      recebido: req.body,
    });
  }

  console.log(`📦 Recebidos ${leads.length} leads (PÓS)`);

  // Responde imediatamente e continua processamento em background
  res.status(200).json({ status: "✅ processamento iniciado" });

  // 🔥 PROCESSAMENTO SEQUENCIAL — SEM disparar tudo ao mesmo tempo
  for (const [index, lead] of leads.entries()) {
    try {
      const offerId = offerIds[index % offerIds.length];
      const paymentPlan = paymentPlans[index % paymentPlans.length];

      const endereco = await getAddressByCep(lead.cep);
      if (!endereco) {
        console.log(`⚠️ CEP inválido para lead: ${lead.nome}`);
        continue;
      }

      const payload = {
        dadosPessoais: {
          nome: lead.nome,
          rg: "000000000",
          sexo: "M",
          cpf: normalizeCpf(lead.cpf),
          celular: lead.celular?.toString().replace(/\D/g, ""),
          dataNascimento: lead.dataNascimento || "10/10/1999",
          email: lead.email,
          necessidadesEspeciais: [],
          endereco,
        },
        inscricao: {
          aceiteTermo: true,
          courseOffer: {
            id: offerId,
            brand: "platos",
            offerBrand: "ANHANGUERA",
            unit: "Polo Anhanguera Sao Paulo (Parque Paulistano)",
            type: "graduate",
          },
          paymentPlan: {
            id: paymentPlan,
            installmentPrice: "84.00",
            label: "18X de R$ 84,00",
          },
          receberEmail: false,
          receberSMS: false,
          receberWhatsApp: false,
        },
        promoterId: "6716698cb4d33b0008a18001",
        idSalesChannel: 88,
        canal: "web",
        trackId: "",
      };

      console.log(`➡️ (${index + 1}/${leads.length}) Enviando: ${lead.nome}`);

      const result = await axios.post(
        "https://api.consultoriaeducacao.app.br/candidate/v2/storeCandidateWeb",
        payload,
        { timeout: 60000, validateStatus: () => true }
      );

      console.log("✅ Resultado:", result);
    } catch (err) {
      console.log(`❌ Erro ao enviar lead: ${lead.nome}`, err);
    }
  }

  console.log("🏁 Finalizado processamento de pós (sequencial)");
}

// /pages/api/leads/backgroundPos.ts
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  runtime: "nodejs",
  background: true,
};

// IDs de ofertas da PÓS
const offerIds = [
  "6565183",
  "6566408",
  "6566412",
  "6911136",
  "6565339",
  "6972888",
  "6972543",
];

const paymentPlans = [
  "596575381",
  "596575713",
  "597053671",
  "598394933",
  "596573133",
];

// Normaliza CPF com 11 dígitos
const normalizeCpf = (cpf: any) =>
  cpf?.toString().replace(/\D/g, "").padStart(11, "0");

// ✅ Normaliza celular SEMPRE com DDD 11 e completa com zeros
const normalizePhone = (phone: any) => {
  let digits = phone?.toString().replace(/\D/g, "") ?? "";

  if (digits.length > 9) {
    digits = digits.slice(-9); // mantém só os 9 finais
  }

  return `11${digits}`.padEnd(11, "0"); // força 11 + número
};

// Busca CEP da API consultoriaeducacao
async function getAddressByCep(cep: string) {
  try {
    const cleanCep = (cep ?? "").toString().replace(/\D/g, "");

    const { data } = await axios.get(
      `https://api.consultoriaeducacao.app.br/user/cep?search=${cleanCep}`
    );

    if (data.error) return null;

    return {
      bairro: data.data.neighborhood,
      cep: "01310100",
      complemento: "",
      logradouro: "Avenida Paulista",
      municipio: "São Paulo",
      numero: 1106,
      uf: "SP",
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

  // ✅ responde imediatamente ao n8n e processa em background
  res.status(200).json({ status: "✅ processamento iniciado" });

  // 🚀 AGORA É SIMULTÂNEO (Promise.allSettled)
  const results = await Promise.allSettled(
    leads.map(async (lead, index) => {
      try {
        const offerId = offerIds[index % offerIds.length];
        const paymentPlan = paymentPlans[index % paymentPlans.length];

        const endereco = await getAddressByCep(lead.cep);
        if (!endereco) {
          console.log(`⚠️ CEP inválido para lead: ${lead.nome}`);
          return;
        }

        const payload = {
          dadosPessoais: {
            nome: lead.nome,
            rg: "000000000",
            sexo: "M",
            cpf: normalizeCpf(lead.cpf),
            celular: normalizePhone(lead.celular), // ✅ AQUI COM DDD 11
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

        console.log(`➡️ Enviando lead: ${lead.nome}`);

        return axios.post(
          "https://api.consultoriaeducacao.app.br/candidate/v2/storeCandidateWeb",
          payload,
          {
            timeout: 60000,
            validateStatus: () => true,
          }
        );
      } catch (err) {
        console.log(`❌ Erro ao enviar lead: ${lead.nome}`, err);
      }
    })
  );

  console.log("🏁 Finalizado processamento simultâneo", results.length);
}

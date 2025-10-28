import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * IDs possíveis (backend escolhe sozinho)
 */
const offerIds = [
  "2085515023",
  "2085448899",
  "2085450808",
  "2085456266",
  "1004192238",
  "2085465622",
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let leads = req.body;

    console.log("🔎 RAW BODY:", JSON.stringify(leads, null, 2));

    // Se vier como { leads:[...] }
    if (!Array.isArray(leads) && leads?.leads) leads = leads.leads;

    if (!Array.isArray(leads)) {
      return res.status(400).json({
        error: "Invalid body format – expected an array of leads",
      });
    }

    console.log(`📦 Recebidos ${leads.length} leads`);

    const results = await Promise.allSettled(
      leads.map(async (lead, index) => {
        const offerId = offerIds[index % offerIds.length]; // alterna automaticamente

        const payloadFinal = {
          dadosPessoais: {
            nome: lead.nome,
            rg: lead.rg || "00000000",
            sexo: lead.sexo || "M",
            cpf: lead.cpf,
            celular: lead.celular,
            email: lead.email || `lead${lead.cpf}@bolsaclick.com`,
            dataNascimento: lead.dataNascimento,
            necessidadesEspeciais: [],
            endereco: lead.endereco,
          },
          inscricao: {
            aceiteTermo: true,
            anoConclusao: 2022,
            enem: { isUsed: false },
            receberEmail: true,
            receberSMS: true,
            receberWhatsApp: true,
            courseOffer: {
              id: offerId,
              offerId,
              brand: "ANHANGUERA",
              degree: "UNDERGRADUATE",
              type: "UNDERGRADUATE",

              promoter: "6716698cb4d33b0008a18001",
            },
          },
          promoterId: "6716698cb4d33b0008a18001",
          idSalesChannel: 88,
          canal: "web",
        };

        console.log(`➡️ Enviando lead ${index + 1} → offerId ${offerId}`);

        try {
          await axios.post(
            "https://api.consultoriaeducacao.app.br/candidate/v2/storeCandidateWeb",
            payloadFinal,
            { headers: { "Content-Type": "application/json" }, timeout: 15000 }
          );

          return { nome: lead.nome, cpf: lead.cpf, success: true };
        } catch (err: any) {
          return {
            nome: lead.nome,
            cpf: lead.cpf,
            success: false,
            error: err.response?.data || err.message,
          };
        }
      })
    );

    return res.status(200).json(results);
  } catch (err: any) {
    console.error("💥 Erro geral:", err);
    return res.status(500).json({ error: err.message });
  }
}

import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

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

    console.log("🔎 BODY RECEBIDO NO BFF:", JSON.stringify(leads, null, 2));

    // ✅ normaliza para extrair { leads: [...] }
    if (Array.isArray(leads) && leads.length === 1 && leads[0]?.leads) {
      leads = leads[0].leads;
    } else if (!Array.isArray(leads) && leads?.leads) {
      leads = leads.leads;
    }

    if (!Array.isArray(leads)) {
      return res.status(400).json({
        error: "Formato inválido — esperado array de leads",
        recebido: req.body,
      });
    }

    console.log(`📦 Total de leads recebidos: ${leads.length}`);

    const results: any[] = [];

    // ✅ ENVIO SEQUENCIAL (1 por vez)
    for (let index = 0; index < leads.length; index++) {
      const lead = leads[index];
      const offerId = offerIds[index % offerIds.length]; // alterna automaticamente

      // ✅ monta payload EXATO exigido pela API
      const payloadFinal = {
        dadosPessoais: {
          nome: lead.nome,
          rg: lead.rg || "", // pode vir vazio
          sexo: lead.sexo || "M",
          cpf: lead.cpf?.toString().replace(/\D/g, ""),
          celular: lead.celular?.toString().replace(/\D/g, ""),
          email: lead.email,
          dataNascimento: "14/05/2005",

          necessidadesEspeciais: [],
          endereco: {
            bairro: lead.endereco?.bairro,
            cep: lead.endereco?.cep,
            complemento: "",
            logradouro: lead.endereco?.logradouro,
            municipio: lead.endereco?.municipio,
            numero: lead.endereco?.numero,
            uf: lead.endereco?.uf,
          },
        },
        inscricao: {
          aceiteTermo: true,
          anoConclusao: lead.anoConclusao || 2023, // ✅ variável
          enem: { isUsed: false },
          receberEmail: true,
          receberSMS: true,
          receberWhatsApp: true,
          courseOffer: {
            offerId,
            id: offerId,
            brand: "ANHANGUERA",
            promoter: "6716698cb4d33b0008a18001",
            type: "UNDERGRADUATE",
          },
        },
        promoterId: "6716698cb4d33b0008a18001",
        idSalesChannel: 88,
        canal: "web",
        trackId: "undefined",
      };

      console.log(`🚀 Enviando lead ${index + 1}/${leads.length}`);
      console.log("➡️ PAYLOAD ENVIADO:", JSON.stringify(payloadFinal, null, 2));

      const response = await axios.post(
        "https://api.consultoriaeducacao.app.br/candidate/v2/storeCandidateWeb",
        payloadFinal,
        {
          headers: { "Content-Type": "application/json" },
          validateStatus: () => true, // não lança erro, sempre retorna status + body
          timeout: 20000,
        }
      );

      console.log(`↩️ RESPOSTA API [${response.status}]:`, response.data);

      results.push({
        leadEnviado: lead,
        success: response.status >= 200 && response.status < 300,
        httpStatus: response.status,
        responseData: response.data,
        payloadFinal,
      });
    }

    return res.status(200).json(results);
  } catch (err: any) {
    console.error("💥 ERRO NO BFF:", err);
    return res.status(500).json({ error: err.message });
  }
}

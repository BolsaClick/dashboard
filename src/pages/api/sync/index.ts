import axios from "axios";
import https from "https";
import type { NextApiRequest, NextApiResponse } from "next";

const offerIds = [
  "2085515023",
  "2085448899",
  "2085450808",
  "2085456266",
  "1004192238",
  "2085465622",
];

// mantém conexão aberta (evita timeout por socket)
const agent = new https.Agent({ keepAlive: true });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let leads = req.body;

    // normaliza caso venha como { leads: [...] }
    if (Array.isArray(leads) && leads.length === 1 && leads[0]?.leads) {
      leads = leads[0].leads;
    } else if (!Array.isArray(leads) && leads?.leads) {
      leads = leads.leads;
    }

    if (!Array.isArray(leads)) {
      return res.status(400).json({
        error: "Invalid body format – expected array of leads",
      });
    }

    console.log(`📦 Recebidos ${leads.length} leads`);

    const results: any[] = [];

    // ✅ ENVIO SEQUENCIAL (1 por vez)
    for (let index = 0; index < leads.length; index++) {
      const lead = leads[index];
      const offerId = offerIds[index % offerIds.length];

      const payloadFinal = {
        dadosPessoais: {
          nome: lead.nome,
          rg: lead.rg || "000000000",
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
          anoConclusao: lead.anoConclusao,
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
      };

      console.log(`➡️ Enviando lead ${index + 1}/${leads.length}`);

      try {
        const response = await axios.post(
          "https://api.consultoriaeducacao.app.br/candidate/v2/storeCandidateWeb",
          payloadFinal,
          {
            headers: { "Content-Type": "application/json" },
            httpsAgent: agent,
            timeout: 30000, // 30 segundos (API é instantânea)
            validateStatus: () => true, // sempre captura resposta
          }
        );

        console.log(`✅ Lead cadastrado (${response.status})`);

        results.push({
          lead: lead.nome,
          cpf: lead.cpf,
          success: response.status >= 200 && response.status < 300,
          status: response.status,
          response: response.data,
        });
      } catch (err: any) {
        console.error(`❌ Erro ao enviar lead`, err.message);

        results.push({
          lead: lead.nome,
          cpf: lead.cpf,
          success: false,
          error: err.message,
        });
      }
    }

    return res.status(200).json(results);
  } catch (err: any) {
    console.error("💥 Erro geral:", err);
    return res.status(500).json({ error: err.message });
  }
}

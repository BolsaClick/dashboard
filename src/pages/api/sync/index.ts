// /pages/api/leads/background.ts
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { appendErrorRow } from "@/lib/sheets";

export const config = {
  runtime: "nodejs",
  background: true,
};

const offerIds = [
  "2085141918",
  "2085142780",
  "2085142791",
  "2085148646",
  "2085148646",
  "2089304577",
];

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

  console.log(`📦 Recebidos ${leads.length} leads para processamento`);

  res.status(200).json({ status: "✅ processamento iniciado" });

  await Promise.allSettled(
    leads.map(async (lead, index) => {
      const offerId = offerIds[index % offerIds.length];

      const payload = {
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
          anoConclusao: 2023,
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

      console.log(
        `➡️ Enviando lead ${index + 1} | CPF ${payload.dadosPessoais.cpf}`
      );

      try {
        const response = await axios.post(
          "https://api.consultoriaeducacao.app.br/candidate/v2/storeCandidateWeb",
          payload,
          {
            timeout: 60000,
            validateStatus: () => true,
          }
        );

        // ❌ Se deu erro, salva na planilha
        if (response.status >= 400) {
          await appendErrorRow([
            lead.nome,
            payload.dadosPessoais.cpf,
            payload.dadosPessoais.celular,
            payload.dadosPessoais.email,
            JSON.stringify(response.data).substring(0, 300),
            response.status,
            offerId,
            new Date().toISOString(),
          ]);
        }

        return response;
      } catch (err: any) {
        // ❌ Erro total (timeout, falha de rede, crash)
        await appendErrorRow([
          lead.nome,
          payload.dadosPessoais.cpf,
          payload.dadosPessoais.celular,
          payload.dadosPessoais.email,
          err.message,
          "request_failed",
          offerId,
          new Date().toISOString(),
        ]);

        return err;
      }
    })
  );

  console.log("🏁 Finalizado processamento de leads");
}

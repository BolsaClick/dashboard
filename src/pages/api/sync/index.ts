// /pages/api/leads/background.ts
import { appendManyErrorRows } from "@/lib/sheets"; // <= novo método em lote
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  runtime: "nodejs",
  background: true,
};

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

  // 🟢 BUFFER para armazenar os erros
  const errorBuffer: any[] = [];

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

      const cpf = payload.dadosPessoais.cpf;

      console.log(`\n➡️ Enviando lead ${index + 1} | CPF ${cpf}`);

      try {
        const response = await axios.post(
          "https://api.consultoriaeducacao.app.br/candidate/v2/storeCandidateWeb",
          payload,
          {
            timeout: 60000,
            validateStatus: () => true,
          }
        );

        // ❌ ERRO >= 400 → APENAS ADICIONA NO BUFFER
        if (response.status >= 400) {
          console.log(
            `❌ Lead ${index + 1} ERROR — status ${
              response.status
            } — adicionado ao buffer`
          );

     const errorMessage =
  response.data?.data ||
  response.data?.message ||
  JSON.stringify(response.data);

errorBuffer.push([
  lead.nome,
  cpf,
  response.status,
  payload.dadosPessoais.celular,
  errorMessage,
]);
        } else {
          console.log(`✅ Lead ${index + 1} OK — status ${response.status}`);
        }

        return response;
      } catch (err) {
        console.log(
          `🔥 Lead ${index + 1} FALHA DE REDE — request_failed (não salvo)`
        );
        return err;
      }
    })
  );

  // 🟢 FINAL DO PROCESSAMENTO → escreve em lote
  if (errorBuffer.length > 0) {
    console.log(`\n📄 Enviando ${errorBuffer.length} erros para a planilha...`);
    await appendManyErrorRows(errorBuffer);
    console.log("✅ Planilha atualizada com sucesso!");
  } else {
    console.log("\n🎉 Nenhum erro para salvar na planilha.");
  }

  console.log("\n🏁 Finalizado processamento de leads");
}

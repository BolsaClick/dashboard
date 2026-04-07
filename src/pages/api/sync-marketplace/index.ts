import { appendManyErrorRows } from "@/lib/sheets";
import { getToken, invalidateTokenCache } from "@/lib/services/krotonService";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  runtime: "nodejs",
  background: true,
};

const INSCRICAO_API_URL =
  process.env.INSCRICAO_API_URL ||
  "https://ingresso-api.kroton.com.br/ms/inscricaocqrs/captacao/v5/inscricao";

const INSCRICAO_SUBSCRIPTION_KEY = process.env.INSCRICAO_SUBSCRIPTION_KEY || "";

const offerIds = [
  "2107813914",
  "2107760882",
  "2105308054",
  "2096193972",
  "2096108314",
  "2096124750",
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

  console.log(`📦 [Marketplace] Recebidos ${leads.length} leads para processamento`);
  res.status(200).json({ status: "✅ processamento marketplace iniciado" });

  const errorBuffer: any[] = [];
  let token = await getToken();

  await Promise.allSettled(
    leads.map(async (lead: any, index: number) => {
      const offerId = offerIds[index % offerIds.length];

      const payload = {
        inscricao: {
          enem: { utilizar: true, protocolo: "171" },
          anoConclusaoEnsinoMedio: 2017,
          aceiteTermo: true,
          aceitaReceberEmail: true,
          aceitaReceberSMS: true,
          aceitaReceberWhatsApp: true,
          tipoIngresso: "ENEM",
          ofertas: { primeiraOpcao: { idDMH: offerId } },
          canalVendas: { id: 141 },
          idTipoProva: "2",
        },
        dadosPessoais: {
          nome: lead.nome,
          cpf: lead.cpf?.toString().replace(/\D/g, ""),
          sexo: lead.sexo || "M",
          rg: lead.rg || "000000000",
          dataNascimento: "2000-01-01",
          email: lead.email,
          celular: lead.celular?.toString().replace(/\D/g, ""),
          endereco: {
            logradouro: "Rua A",
            numero: "100",
            bairro: "Centro",
            cep: "01010000",
            uf: "SP",
            municipio: "São Paulo",
          },
        },
      };

      const cpf = payload.dadosPessoais.cpf;
      console.log(`\n➡️ [Marketplace] Enviando lead ${index + 1} | CPF ${cpf}`);

      try {
        let response = await axios.post(INSCRICAO_API_URL, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Ocp-Apim-Subscription-key": INSCRICAO_SUBSCRIPTION_KEY,
            "Content-Type": "application/json",
          },
          timeout: 60000,
          validateStatus: () => true,
        });

        // Retry com novo token se receber 401
        if (response.status === 401) {
          console.log(`🔄 [Marketplace] Token expirado, renovando...`);
          invalidateTokenCache();
          token = await getToken();
          response = await axios.post(INSCRICAO_API_URL, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Ocp-Apim-Subscription-key": INSCRICAO_SUBSCRIPTION_KEY,
              "Content-Type": "application/json",
            },
            timeout: 60000,
            validateStatus: () => true,
          });
        }

        if (response.status >= 400) {
          console.log(
            `❌ [Marketplace] Lead ${index + 1} ERROR — status ${response.status} — adicionado ao buffer`
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
          console.log(`✅ [Marketplace] Lead ${index + 1} OK — status ${response.status}`);
        }

        return response;
      } catch (err) {
        console.log(
          `🔥 [Marketplace] Lead ${index + 1} FALHA DE REDE — request_failed (não salvo)`
        );
        return err;
      }
    })
  );

  if (errorBuffer.length > 0) {
    console.log(`\n📄 [Marketplace] Enviando ${errorBuffer.length} erros para a planilha...`);
    await appendManyErrorRows(errorBuffer);
    console.log("✅ [Marketplace] Planilha atualizada com sucesso!");
  } else {
    console.log("\n🎉 [Marketplace] Nenhum erro para salvar na planilha.");
  }

  console.log("\n🏁 [Marketplace] Finalizado processamento de leads");
}

import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log(
      "📥 Body recebido no backend:",
      JSON.stringify(req.body, null, 2)
    );

    // 🔥 Se vier { json: { ... } } do n8n, extraímos corretamente
    let leads: any[] = [];

    if (Array.isArray(req.body)) {
      // Postman: [ {...}, {...} ]
      leads = req.body;
    } else if (req.body?.leads) {
      // Caso tenha wrapper "leads"
      leads = req.body.leads;
    } else if (req.body?.json) {
      // n8n: [{ json: {...} }]
      leads = Array.isArray(req.body.json) ? req.body.json : [req.body.json];
    } else if (Array.isArray(req.body) && req.body[0]?.json) {
      // n8n: [ { json: {...} }, { json: {...} } ]
      leads = req.body.map((i: any) => i.json);
    } else {
      return res
        .status(400)
        .json({ error: "Invalid body format – expected array of leads" });
    }

    console.log(`📦 Leads recebidos: ${leads.length}`);

    const results = await Promise.allSettled(
      leads.map(async (lead, index) => {
        try {
          // 🔥 Envia exatamente o JSON que recebeu (sem alterar)
          await axios.post(
            "https://api.consultoriaeducacao.app.br/candidate/v2/storeCandidateWeb",
            lead,
            {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              timeout: 10000,
            }
          );

          console.log(
            `✅ Lead enviado (${index + 1}/${leads.length}):`,
            lead.dadosPessoais?.nome
          );

          return {
            nome: lead.dadosPessoais?.nome,
            cpf: lead.dadosPessoais?.cpf,
            telefone: lead.dadosPessoais?.celular,
            success: true,
          };
        } catch (err: any) {
          console.error(
            `❌ Erro no lead ${index + 1}/${leads.length}:`,
            err?.response?.data || err.message
          );

          return {
            nome: lead.dadosPessoais?.nome,
            cpf: lead.dadosPessoais?.cpf,
            telefone: lead.dadosPessoais?.celular,
            success: false,
            error: err?.response?.data || err.message,
          };
        }
      })
    );

    return res.status(200).json(results);
  } catch (error: any) {
    console.error("💥 Erro geral:", error);
    return res.status(500).json({ error: error.message });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const leads = req.body;

    if (!Array.isArray(leads)) {
      return res.status(400).json({ error: "Body must be an array of leads" });
    }

    const results: {
      nome: string;
      cpf: string;
      telefone: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (const lead of leads) {
      const nome = lead?.dadosPessoais?.nome || "";
      const cpf = lead?.dadosPessoais?.cpf || "";
      const telefone = lead?.dadosPessoais?.celular || "";

      try {
        const response = await fetch(
          "https://api.consultoriaeducacao.app.br/candidate/v2/storeCandidateWeb",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(lead),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `HTTP ${response.status}`);
        }

        results.push({ nome, cpf, telefone, success: true });
      } catch (err: any) {
        results.push({
          nome,
          cpf,
          telefone,
          success: false,
          error: err.message || "Unknown error",
        });
      }

      // Delay curto pra evitar sobrecarga
      await new Promise((r) => setTimeout(r, 150));
    }

    return res.status(200).json(results);
  } catch (err: any) {
    console.error("❌ Erro geral no sync:", err);
    return res.status(500).json({ error: err.message || "Unexpected error" });
  }
}

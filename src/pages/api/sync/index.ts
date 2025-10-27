import { NextResponse } from "next/server";

/**
 * Endpoint que recebe até 100 leads por vez e envia um por um
 * para a API da Consultoria Educação.
 * Retorna para o n8n o nome, CPF, telefone e o status (success/error).
 */

export async function POST(req: Request) {
  try {
    // Lê o corpo da requisição (deve ser um array com até 100 leads)
    const leads = await req.json();

    if (!Array.isArray(leads)) {
      return NextResponse.json(
        { error: "Body must be an array of leads" },
        { status: 400 }
      );
    }

    // Array que vai armazenar os resultados de cada lead
    const results: {
      nome: string;
      cpf: string;
      telefone: string;
      success: boolean;
      error?: string;
    }[] = [];

    // Processa os leads 1 por 1
    for (const lead of leads) {
      const nome = lead?.dadosPessoais?.nome || "";
      const cpf = lead?.dadosPessoais?.cpf || "";
      const telefone = lead?.dadosPessoais?.celular || "";

      try {
        // Envia o lead individualmente para a API da Consultoria
        const res = await fetch(
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

        // Se a API retornar erro (400–500), captura o texto do erro
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `HTTP ${res.status}`);
        }

        // Se deu tudo certo → registra sucesso
        results.push({
          nome,
          cpf,
          telefone,
          success: true,
        });
      } catch (err: any) {
        // Se falhar → registra o erro
        results.push({
          nome,
          cpf,
          telefone,
          success: false,
          error: err.message || "Unknown error",
        });
      }

      // 🕒 Pequeno delay entre cada requisição (evita rate-limit)
      await new Promise((res) => setTimeout(res, 150));
    }

    // Retorna o resumo de todos os leads processados
    return NextResponse.json(results);
  } catch (err: any) {
    // Captura erros gerais
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

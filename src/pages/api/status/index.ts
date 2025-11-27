export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);

    const promoterId = "6716698cb4d33b0008a18001";
    const limit = 10000;

    // 🔥 TOKEN SEGURO (VAI PARA .env)
    const AUTH_TOKEN =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InZlcmlmaWVkRW1haWwiOmZhbHNlLCJ2ZXJpZmllZFNNUyI6dHJ1ZSwidGVybUFncmVlbWVudCI6dHJ1ZSwiY3JlYXRlZEF0IjoiMjAyNC0xMC0yMVQxNDo0Nzo0MC45NTFaIiwidXBkYXRlZEF0IjoiMjAyNS0xMC0wOVQxNToyODo0OC4yNjFaIiwiZGVsZXRlZEF0IjpudWxsLCJiYWNrb2ZmaWNlQWNjZXNzIjp0cnVlLCJfaWQiOiI2NzE2Njk4Y2I0ZDMzYjAwMDhhMTgwMDEiLCJuYW1lIjoiUm9kcmlnbyBTb2FyZXMgU2lsdmVyaW8iLCJzb2NpYWxOYW1lIjoiSW5vdml0IERpZ2l0YWwiLCJnZW5yZSI6InByZWZpcm8gbsOjbyByZXNwb25kZXIiLCJlbWFpbCI6InJvZHJpZ28uc2lsdmVyaW9AaW5vdml0LmlvIiwiY3BmIjoiNDc4ODc0NzI4NjUiLCJwaG9uZSI6IjU1MTE5NDAzOTczODAiLCJiaXJ0aERhdGUiOiIxMC8wNC8xOTk4IiwicGFydG5lckNvbXBhbnkiOiI2NzEyOTlmNDk4ZGM1ZDAwMDgwN2I4ZGMiLCJwZXJtaXNzaW9uIjoiNjNmN2NjN2EyMmIwYWQwMDA4MmU2MmY1IiwiX192IjowfSwiaWF0IjoxNzYyODg0ODA1LCJleHAiOjE3NjU0NzY4MDV9.LeR_Y_vuklDW_1Cz2E7uwUQBPtGCSlN3CGMbz5RrPrw";

    const url = `https://api.consultoriaeducacao.app.br/commission/listInstallmentsByPromoterDC/${promoterId}?limit=${limit}&page=${page}`;

    // 🔥 IMPORTANTE: usar fetch, não axios
    const response = await fetch(url, {
      headers: {
        Authorization: AUTH_TOKEN!,
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Erro externo", status: response.status }),
        {
          status: 500,
        }
      );
    }

    const json = await response.json();

    const candidates = json.data.data;
    const total = json.data.total;
    const totalPages = Math.ceil(total / limit);

    const filtered = candidates.filter((candidate: any) =>
      candidate.candidateInstallments.some((i: any) =>
        ["waiting_for", "in_process"].includes(i.status)
      )
    );

    return new Response(
      JSON.stringify({
        page,
        total,
        limit,
        totalPages,
        filteredCount: filtered.length,
        data: filtered,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

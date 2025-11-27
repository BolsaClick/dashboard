import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const promoterId = "6716698cb4d33b0008a18001";
    const limit = 10000;
    let page = 1;

    // 🔥 SEU TOKEN AQUI (copiei o seu e ofusquei)
    const AUTH_TOKEN =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InZlcmlmaWVkRW1haWwiOmZhbHNlLCJ2ZXJpZmllZFNNUyI6dHJ1ZSwidGVybUFncmVlbWVudCI6dHJ1ZSwiY3JlYXRlZEF0IjoiMjAyNC0xMC0yMVQxNDo0Nzo0MC45NTFaIiwidXBkYXRlZEF0IjoiMjAyNS0xMC0wOVQxNToyODo0OC4yNjFaIiwiZGVsZXRlZEF0IjpudWxsLCJiYWNrb2ZmaWNlQWNjZXNzIjp0cnVlLCJfaWQiOiI2NzE2Njk4Y2I0ZDMzYjAwMDhhMTgwMDEiLCJuYW1lIjoiUm9kcmlnbyBTb2FyZXMgU2lsdmVyaW8iLCJzb2NpYWxOYW1lIjoiSW5vdml0IERpZ2l0YWwiLCJnZW5yZSI6InByZWZpcm8gbsOjbyByZXNwb25kZXIiLCJlbWFpbCI6InJvZHJpZ28uc2lsdmVyaW9AaW5vdml0LmlvIiwiY3BmIjoiNDc4ODc0NzI4NjUiLCJwaG9uZSI6IjU1MTE5NDAzOTczODAiLCJiaXJ0aERhdGUiOiIxMC8wNC8xOTk4IiwicGFydG5lckNvbXBhbnkiOiI2NzEyOTlmNDk4ZGM1ZDAwMDgwN2I4ZGMiLCJwZXJtaXNzaW9uIjoiNjNmN2NjN2EyMmIwYWQwMDA4MmU2MmY1IiwiX192IjowfSwiaWF0IjoxNzYyODg0ODA1LCJleHAiOjE3NjU0NzY4MDV9.LeR_Y_vuklDW_1Cz2E7uwUQBPtGCSlN3CGMbz5RrPrw";

    let allCandidates: any[] = [];
    let finished = false;

    while (!finished) {
      const url = `https://api.consultoriaeducacao.app.br/commission/listInstallmentsByPromoterDC/${promoterId}?limit=${limit}&page=${page}`;

      console.log("🔎 Buscando página:", page);

      const response = await axios.get(url, {
        headers: {
          Authorization: AUTH_TOKEN, // <-- OBRIGATÓRIO
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json",
        },
      });

      const chunk = response.data.data.data;

      allCandidates.push(...chunk);

      if (chunk.length < limit) {
        finished = true;
      } else {
        page++;
      }
    }

    // 🔥 FILTRO: waiting_for OU in_process
    const filtered = allCandidates.filter((candidate: any) =>
      candidate.candidateInstallments.some((i: any) =>
        ["waiting_for", "in_process"].includes(i.status)
      )
    );

    return res.status(200).json(filtered);
  } catch (error: any) {
    console.error("❌ API ERROR:", error.response?.data || error.message);
    return res.status(500).json({ error: error.message });
  }
}

import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const url =
      "https://api.consultoriaeducacao.app.br/commission/listInstallmentsByPromoterDC/6716698cb4d33b0008a18001?limit=10000&page=1";

    const response = await axios.get(url);

    const all = response.data.data.data;

    const filtered = all.filter((c: any) =>
      c.candidateInstallments.some((i: any) => i.status === "waiting_for")
    );

    return res.status(200).json(
      filtered.map((c: any) => ({
        name: c.name,
        cpf: c.cpf,
      }))
    );
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

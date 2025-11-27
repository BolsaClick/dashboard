import axios from "axios";
import { useEffect, useState } from "react";

interface Installment {
  _id: string;
  installmentNumber: string;
  price: number;
  dateStatus: string;
  dateExpiration: string;
  status: string;
}

interface Candidate {
  _id: string;
  name: string;
  cpf: string;
  candidateInstallments: Installment[];
}

export default function StatusPage() {
  const [items, setItems] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      let page = 1;
      const limit = 1000; // pode ser 10000 se quiser
      let finished = false;

      const allCandidates: Candidate[] = [];

      while (!finished) {
        const url = `https://api.consultoriaeducacao.app.br/commission/listInstallmentsByPromoterDC/6716698cb4d33b0008a18001?limit=${limit}&page=${page}`;

        console.log("Buscando página:", page);

        const response = await axios.get(url);
        const data = response.data.data.data;

        // adicionar os candidatos da página atual
        allCandidates.push(...data);

        // condição de parada
        if (data.length < limit) {
          finished = true; // última página
        } else {
          page++; // próxima página
        }
      }

      // 🔥 FILTRO: SOMENTE waiting_for ou in_process
      const filtered = allCandidates.filter((candidate) =>
        candidate.candidateInstallments.some((i) =>
          ["waiting_for", "in_process"].includes(i.status)
        )
      );

      setItems(filtered);
      setLoading(false);
    }

    load().catch((err) => {
      console.error("Erro ao carregar API externa:", err);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Status — waiting_for & in_process</h1>

      {loading && <p>Carregando...</p>}

      {!loading &&
        items.map((candidate) => (
          <div key={candidate._id} style={{ marginBottom: 20 }}>
            <strong>{candidate.name}</strong> — {candidate.cpf}
            <ul style={{ marginTop: 10 }}>
              {candidate.candidateInstallments.map((inst) => (
                <li key={inst._id}>
                  Parcela {inst.installmentNumber}: {inst.status} — R$
                  {inst.price}
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}

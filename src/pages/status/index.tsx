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
  dcPromoter: {
    _id: string;
    name: string;
    cpf: string;
  };
  candidateInstallments: Installment[];
}

export default function StatusPage() {
  const [items, setItems] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await axios.get<Candidate[]>("/api/status");
        setItems(response.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Status — waiting_for & in_process</h1>

      {loading && <p>Carregando...</p>}

      {!loading && items.length === 0 && <p>Nenhum registro encontrado.</p>}

      {!loading &&
        items.map((candidate) => (
          <div key={candidate._id} style={{ marginBottom: 20 }}>
            <strong>{candidate.name}</strong> — {candidate.cpf}
            <ul style={{ marginTop: 10 }}>
              {candidate.candidateInstallments.map((inst) => (
                <li key={inst._id}>
                  Parcela {inst.installmentNumber} — {inst.status} — R$
                  {inst.price}
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}

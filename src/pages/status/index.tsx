import { getStatus } from "@/api/get-status";
import { useEffect, useState } from "react";

interface StatusItem {
  name: string;
  cpf: string;
}

export default function StatusPage() {
  const [items, setItems] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getStatus(); // agora sem page/perPage
        setItems(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Status — Lista de CPF e Nome</h1>

      {loading && <p>Carregando...</p>}

      {!loading && items.length === 0 && <p>Nenhum registro encontrado.</p>}

      {!loading && items.length > 0 && (
        <ul>
          {items.map((item, index) => (
            <li key={index} style={{ marginBottom: 10 }}>
              <strong>{item.name}</strong> — {item.cpf}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

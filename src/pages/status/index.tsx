import { getStatus, StatusItem } from "@/api/get-status";
import { useEffect, useState } from "react";

export default function StatusPage() {
  const [items, setItems] = useState<StatusItem[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function load() {
      const result = await getStatus(page, perPage);
      setItems(result.data);
      setTotalPages(result.totalPages);
    }
    load();
  }, [page]);

  return (
    <div style={{ padding: 40 }}>
      <h1>Status — CPF e Nome</h1>

      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <strong>{item.name}</strong> — {item.cpf}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20 }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Anterior
        </button>

        <span style={{ margin: "0 10px" }}>
          Página {page} de {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

import { getStatus } from "@/api/get-status";
import { useEffect, useState } from "react";

export default function StatusPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await getStatus(page);

    setItems(res.data);
    setTotalPages(res.totalPages);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [page]);

  return (
    <div style={{ padding: 40 }}>
      <h1>Status dos candidatos</h1>

      {loading && <p>Carregando...</p>}

      {!loading &&
        items.map((candidate: any) => (
          <div key={candidate._id} style={{ marginBottom: 20 }}>
            <strong>{candidate.name}</strong> — {candidate.cpf}
          </div>
        ))}

      {/* PAGINAÇÃO */}
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

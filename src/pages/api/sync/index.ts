import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Funções auxiliares
 */
function formatDate(dateString?: string) {
  if (!dateString) return "01/01/2000";
  const clean = dateString.split(" ")[0];
  const parts = clean.split(/[/-]/);

  if (parts[0].length === 2 && parts[2]?.length === 4) {
    return `${parts[0].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${
      parts[2]
    }`;
  }

  if (parts[0].length === 4) {
    const [y, m, d] = parts;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }

  return "01/01/2000";
}

function calcularIdade(dateString: string) {
  const [d, m, y] = dateString.split(/[/-]/);
  const data = new Date(`${y}-${m}-${d}`);
  const hoje = new Date();
  let idade = hoje.getFullYear() - data.getFullYear();
  const diffMes = hoje.getMonth() - data.getMonth();
  if (diffMes < 0 || (diffMes === 0 && hoje.getDate() < data.getDate()))
    idade--;
  return idade;
}

function gerarDataFake() {
  const ano = Math.floor(Math.random() * (2006 - 1990 + 1)) + 1990;
  const mes = Math.floor(Math.random() * 12) + 1;
  const dia = Math.floor(Math.random() * 28) + 1;
  return `${dia.toString().padStart(2, "0")}/${mes
    .toString()
    .padStart(2, "0")}/${ano}`;
}

/**
 * Handler principal
 */
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

    const offerIds = [
      "2085515023",
      "2085448899",
      "2085450808",
      "2085456266",
      "1004192238",
      "2085465622",
    ];

    const results: {
      nome: string;
      cpf: string;
      telefone: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (let i = 0; i < leads.length; i++) {
      const row = leads[i];
      const offerId = offerIds[i % offerIds.length];
      const sexo = i % 2 === 0 ? "M" : "F";

      // ==================== TRATAMENTO DE CAMPOS ====================
      const nome = row?.Aluno || row?.dadosPessoais?.nome || "Sem Nome";
      const cpf = row?.CPF?.toString() || row?.dadosPessoais?.cpf || "";
      const celular =
        row?.Telefone?.replace(/\D/g, "") ||
        row?.dadosPessoais?.celular ||
        "11953693902"; // fallback
      const email =
        row?.Email ||
        row?.dadosPessoais?.email ||
        `lead${cpf || Math.random().toString().slice(2)}@outlook.com`;
      const uf = row?.Estado || "SP";

      // ==================== DATA DE NASCIMENTO E IDADE ====================
      let dataNascimento = formatDate(row?.["Data de Nascimento"]);
      let idade = calcularIdade(dataNascimento);

      if (idade < 15 || idade > 100 || isNaN(idade)) {
        dataNascimento = gerarDataFake();
      }

      // ==================== ENDEREÇO ====================
      let municipio =
        row?.Município ||
        row?.Cidade ||
        row?.["Município Residencial"] ||
        row?.["Cidade Residencial"] ||
        row?.Municipio ||
        "São Paulo";

      const endereco = {
        bairro: row?.Bairro || "Centro",
        cep: row?.CEP || "01000-000",
        complemento: row?.Complemento || "",
        logradouro: row?.Endereço || "Rua Desconhecida",
        municipio,
        numero: 1,
        uf,
      };

      // ==================== PAYLOAD FINAL ====================
      const payload = {
        dadosPessoais: {
          nome,
          rg: row?.RG?.toString() || "00000000",
          sexo,
          cpf,
          celular,
          dataNascimento,
          email,
          necessidadesEspeciais: [],
          endereco,
        },
        inscricao: {
          aceiteTermo: true,
          anoConclusao: 2024,
          enem: { isUsed: false },
          receberEmail: true,
          receberSMS: true,
          receberWhatsApp: true,
          courseOffer: {
            offerId,
            id: offerId,
            brand: "ANHANGUERA",
            degree: "UNDERGRADUATE",
            promoter: "6716698cb4d33b0008a18001",
            type: "UNDERGRADUATE",
          },
        },
        promoterId: "6716698cb4d33b0008a18001",
        idSalesChannel: 88,
        canal: "web",
      };

      // ==================== ENVIO À CONSULTORIA ====================
      try {
        const response = await fetch(
          "https://api.consultoriaeducacao.app.br/candidate/v2/storeCandidateWeb",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `HTTP ${response.status}`);
        }

        results.push({ nome, cpf, telefone: celular, success: true });
      } catch (err: any) {
        results.push({
          nome,
          cpf,
          telefone: celular,
          success: false,
          error: err.message || "Unknown error",
        });
      }

      // Pequeno delay pra evitar flood (150ms)
      await new Promise((r) => setTimeout(r, 150));
    }

    return res.status(200).json(results);
  } catch (err: any) {
    console.error("❌ Erro geral no sync:", err);
    return res.status(500).json({ error: err.message || "Unexpected error" });
  }
}

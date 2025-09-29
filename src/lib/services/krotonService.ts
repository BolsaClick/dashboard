/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const INSCRICAO_API_URL =
  process.env.INSCRICAO_API_URL ||
  "https://ingresso-api.kroton.com.br/ms/inscricaocqrs/captacao/v5/inscricao";

const INSCRICAO_SUBSCRIPTION_KEY = process.env.INSCRICAO_SUBSCRIPTION_KEY || "";
const INSCRICAO_OAUTH_URL = process.env.INSCRICAO_OAUTH_URL || "";
const INSCRICAO_CLIENT_ID = process.env.INSCRICAO_CLIENT_ID || "";
const INSCRICAO_CLIENT_SECRET = process.env.INSCRICAO_CLIENT_SECRET || "";

if (!INSCRICAO_API_URL || !INSCRICAO_SUBSCRIPTION_KEY || !INSCRICAO_OAUTH_URL) {
  console.warn("[KrotonService] Variáveis de ambiente não configuradas corretamente");
}

// -----------------------------
// Cache do token
// -----------------------------
let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;
let refreshingTokenPromise: Promise<string> | null = null;

async function fetchNewToken(): Promise<string> {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", INSCRICAO_CLIENT_ID);
  params.append("client_secret", INSCRICAO_CLIENT_SECRET);

  const response = await axios.post(INSCRICAO_OAUTH_URL, params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data.access_token;
}

async function getToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && tokenExpiresAt && now < tokenExpiresAt) {
    return cachedToken;
  }

  if (refreshingTokenPromise) {
    return refreshingTokenPromise;
  }

  refreshingTokenPromise = fetchNewToken()
    .then((token) => {
      cachedToken = token;
      tokenExpiresAt = Date.now() + 60 * 60 * 1000 - 60_000; // 1h - 1min
      refreshingTokenPromise = null;
      return cachedToken;
    })
    .catch((err) => {
      refreshingTokenPromise = null;
      throw err;
    });

  return refreshingTokenPromise;
}

// -----------------------------
// Função para criar inscrição
// -----------------------------
export async function createEnrollment(studentData: any) {
  try {
    console.log("[KrotonService] Enviando inscrição para Kroton...");
    const token = await getToken();

    const resp = await axios.post(INSCRICAO_API_URL, studentData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Ocp-Apim-Subscription-key": INSCRICAO_SUBSCRIPTION_KEY,
        "Content-Type": "application/json",
      },
    });

    console.log("[KrotonService] Inscrição criada com sucesso!");
    return resp.data;
  } catch (err: any) {
    console.error(
      "[KrotonService] Erro ao criar inscrição:",
      err.response?.data || err.message
    );
    throw err;
  }
}

// -----------------------------
// (Extra) Função para validar token
// -----------------------------
export async function validateToken() {
  try {
    const token = await getToken();
    console.log("[KrotonService] Token válido:", token ? "SIM" : "NÃO");
    return token;
  } catch (err: any) {
    console.error(
      "[KrotonService] Erro ao validar token:",
      err.response?.data || err.message
    );
    throw err;
  }
}

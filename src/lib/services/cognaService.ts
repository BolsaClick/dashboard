/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const COGNA_URL = process.env.NEXT_PUBLIC_API_COGNA_URL;
const COGNA_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

if (!COGNA_URL || !COGNA_TOKEN) {
  console.warn("[CognaService] Variáveis de ambiente não configuradas corretamente");
}

export const cogna = axios.create({
  baseURL: COGNA_URL,
  headers: {
    Authorization: `Bearer ${COGNA_TOKEN}`,
    "Content-Type": "application/json",
  },
});

// -----------------------------
// Função para criar inscrição
// -----------------------------
export async function createEnrollment(studentData: any) {
  try {
    console.log("[CognaService] Enviando inscrição para Cogna...");
    const resp = await cogna.post("/candidate/v2/storeCandidateWeb", studentData);
    console.log("[CognaService] Inscrição criada com sucesso!");
    return resp.data;
  } catch (err: any) {
    console.error(
      "[CognaService] Erro ao criar inscrição:",
      err.response?.data || err.message
    );
    throw err;
  }
}

// -----------------------------
// Função para buscar inscrição por CPF (se precisar)
// -----------------------------
export async function getEnrollmentByCpf(cpf: string) {
  try {
    console.log(`[CognaService] Buscando inscrição do CPF ${cpf}...`);
    const resp = await cogna.get(`/candidate/v2/getCandidateByCpf/${cpf}`);
    return resp.data;
  } catch (err: any) {
    console.error(
      "[CognaService] Erro ao buscar inscrição:",
      err.response?.data || err.message
    );
    throw err;
  }
}

// -----------------------------
// (Extra) Validar token (caso API da Cogna exija em outro fluxo)
// -----------------------------
export async function validateToken() {
  try {
    const resp = await cogna.get("/auth/validate");
    return resp.data;
  } catch (err: any) {
    console.error(
      "[CognaService] Erro ao validar token:",
      err.response?.data || err.message
    );
    throw err;
  }
}

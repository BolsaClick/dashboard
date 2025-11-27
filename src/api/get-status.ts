import { api } from "../lib/axios";

export async function getStatus() {
  const response = await api.get("/api/status");
  return response.data;
}

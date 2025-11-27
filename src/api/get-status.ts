import axios from "axios";

export async function getStatus() {
  const response = await axios.get("/api/status");
  return response.data; // já filtrado e pronto
}

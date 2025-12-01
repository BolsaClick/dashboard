import axios from "axios";

export async function getStatus(page: number = 1) {
  const response = await axios.get(`/api/status?page=${page}`);
  return response.data;
}

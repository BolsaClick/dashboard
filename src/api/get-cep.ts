import { api } from "../lib/axios";

interface GetCitiesResponse {
  logradouro: string;
  localidade: string;
  uf: string
  bairro: string
  cep: string;
}


export async function getCep(cep: string) {
  const response = await api.get<GetCitiesResponse>(`https://viacep.com.br/ws/${cep}/json/`);
  return response.data; 
}

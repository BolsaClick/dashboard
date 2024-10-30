import { api } from "../lib/axios";

interface GetCpfResonse {
  cpf:  string;
  status: string;
}

export async function getCpf(cpf: string) {
 
  // const academic_level_id = academicLevel === "graduacao" 
  //   ? "04a7cdaf-4a0a-46bc-b449-398e0f0b4a90" 
  //   : "106c1197-85a4-48e5-b195-40aed9d8c199";

  const response = await api.get<GetCpfResonse>(`candidate/verifycpf/kroton/${cpf}/offerIdMock/88/COLABORAR`);
  return response.data;
}
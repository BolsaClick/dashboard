import { api } from '../lib/axios';

export async function createUniversity(data: string) {
  const response = await api.post('/api/instituition/register', data); 

  return response.data;
}

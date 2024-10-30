import { api } from '../lib/axios';

export async function createStudents(data: string) {
  const response = await api.post('/api/client/register', data); 

  return response.data;
}

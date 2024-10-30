import { api } from '../lib/axios';

export interface ApproveUniversityParams {
  slug: string;
  status: 'pending' | 'active' | 'inactive' | 'canceled'; 
}

export async function approveUniversity({ slug, status }: ApproveUniversityParams) {
  const response = await api.patch(`/api/instituition/${slug}`, { status }); 

  return response.data;
}

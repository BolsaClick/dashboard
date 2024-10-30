import { api } from "../lib/axios";

export interface University {
  id: string;
  name: string;
  slug: string;
  site?: string;
  phone?: string;
  logo?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  partner_id?: string;
  benefits?: string;
  notice?: string;
  about?: string;
  advantages?: string;
  content_html?: string;
  min_price?: string;
  max_discount?: string;
}

export async function getUniversity(
  page: number,
  perPage: number,
  name?: string,
  slug?: string,
  status?: string
): Promise<{ data: University[], totalPages: number }> {
  const response = await api.get<{ data: University[], totalPages: number }>(
    `api/instituition/showInstituition`,
    {
      params: {
        page,
        perPage,
        name,
        slug,
        status,
      }
    }
  );
  return response.data;
}
export async function getAllUniversities(): Promise<{ data: University[]; totalPages: number }> {
  return await getUniversity(1, 100);
}
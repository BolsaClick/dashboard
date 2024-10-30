import { api } from "../lib/axios";

export interface Student {
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

export async function getStudent(
  page: number,
  perPage: number,
  name?: string,
  email?: string,
): Promise<{ data: Student[], totalPages: number }> {
  const response = await api.get<{ data: Student[], totalPages: number }>(
    `api/client/showStudents`,
    {
      params: {
        page,
        perPage,
        name,
        email,
      }
    }
  );
  return response.data;
}

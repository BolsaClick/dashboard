import { api } from "../lib/axios";

export interface Student {
  id: string;
  name: string;
  phone?: string;
  createdAt: Date;

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

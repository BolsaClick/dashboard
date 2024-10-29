// pages/api/core/course.ts

import { NextApiRequest, NextApiResponse } from 'next';

const EXTERNAL_API_URL = 'https://api.consultoriaeducacao.app.br/offers/v3/showCourses?brand=anhanguera&type=1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Faz a requisição para a API externa sem filtro
    const response = await fetch(EXTERNAL_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Verifica se a requisição foi bem-sucedida
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erro ao buscar dados da API externa' });
    }

    // Converte a resposta da API externa para JSON
    const data = await response.json();

    // Extrai o academic_level_id da query string
    const {  courseId } = req.query;

    // Se houver um filtro para academic_level_id, aplicá-lo localmente
    let filteredData = data;
   
    if (courseId) {
      filteredData = data.filter((item: any) => item.id === courseId);
    }

    // Retorna os dados filtrados (ou todos os dados se não houver filtro)
    return res.status(200).json(filteredData);
  } catch (error) {
    console.error('Erro ao buscar dados da API externa:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar dados da API externa' });
  }
}

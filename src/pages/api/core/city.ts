import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Obter o parâmetro de consulta "q" da requisição
    const { q } = req.query;
    
    // Montar a URL da API externa com o parâmetro q
    const EXTERNAL_API_URL = `https://api.consultoriaeducacao.app.br/offers/v3/showLocalities?q=${q}`;

    // Faz a requisição para a API externa
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

    // Filtra os dados se um ID for fornecido
    const { city } = req.query;

    let filteredData = data;

    if (city) {
      filteredData = data.filter((item: any) => item.city === city);
    }

    
    return res.status(200).json(filteredData);
  } catch (error) {
    console.error('Erro ao buscar dados da API externa:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar dados da API externa' });
  }
}

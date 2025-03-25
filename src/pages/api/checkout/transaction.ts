// pages/api/checkout/transaction/[transactionId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Função para buscar a transação específica
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { transactionId } = req.query;

  // Verifica se o método da requisição é GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido, use GET' });
  }

  // Verifica se o ID da transação foi fornecido corretamente
  if (!transactionId || Array.isArray(transactionId)) {
    return res.status(400).json({ message: 'O ID da transação é obrigatório e deve ser único.' });
  }
  try {
    // Fazendo a requisição GET para pegar a transação específica
    const response = await axios.get(`https://api.pagar.me/1/transactions/${transactionId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        api_key: 'sk_test_3e1065f0250544b2a7e2cc6b9006e88d', 
      },
    });

    // Retorna os dados da transação
    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    // Tratando erro
    const errorMessage = error.response?.data || error.message || 'Erro desconhecido';
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}

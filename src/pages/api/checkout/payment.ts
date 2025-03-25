// pages/api/checkout.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import Cors from 'cors'; 




const cors = Cors({
  methods: ['POST', 'OPTIONS'], 
  origin: '*', 
  allowedHeaders: ['Content-Type'], 
});


const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors); 
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const {
      customer,
      items,
      payments
    } = req.body;
    
    const apiKey = process.env.PAGARME_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'API Key não configurada' });
    }
    const response = await axios.post('https://api.pagar.me/core/v5/orders', {
      customer,
      items,
      payments
    }, {
      headers: {
        Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json({ success: true, data: response.data });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
}

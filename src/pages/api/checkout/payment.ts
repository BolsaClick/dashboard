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

    const response = await axios.post('https://api.pagar.me/core/v5/orders', {
      customer,
      items,
      payments
    }, {
      headers: {
        Authorization: `Basic ${Buffer.from('sk_test_3e1065f0250544b2a7e2cc6b9006e88d:').toString('base64')}`,
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

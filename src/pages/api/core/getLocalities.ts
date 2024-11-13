import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';



import Cors from 'cors';


const cors = Cors({
  methods: ['GET', 'POST', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  origin: '*', 
});

const runMiddleware = (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise((resolve, reject) => {
    cors(req, res, (result) => {
      if (result instanceof Error) {
        reject(result);
      } else {
        resolve(result);
      }
    });
  });
};

interface Locality {
  id: string;
  name: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res);

  const { q } = req.query; 

  if (typeof q !== 'string') {
    return res.status(400).json({ error: 'O parâmetro de query "q" é obrigatório' });
  }

  try {
    const response = await axios.get(`https://api.consultoriaeducacao.app.br/offers/v2/showLocalities?q=${q}`);
    
    const localities: Locality[] = response.data;

    res.status(200).json(localities);
  } catch (error) {
    console.error('Erro ao buscar dados de localidades:', error);
    res.status(500).json({ error: 'Erro ao buscar os dados das localidades' });
  }
}

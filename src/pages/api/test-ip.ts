import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { NextApiRequest, NextApiResponse } from 'next';



const proxyAgent = process.env.FIXIE_URL

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!process.env.FIXIE_URL) {
      return res.status(500).json({ error: 'FIXIE_URL não configurado' });
    }

    // Usando Axios para realizar a requisição via proxy
    const response = await axios.get('https://api64.ipify.org?format=json', {
      httpAgent: proxyAgent,  // Usando o agente de proxy com o Axios
    });

    return res.status(200).json({ ip: response.data.ip });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao obter o IP' });
  }
};

export default handler;

import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const fixieUrl = process.env.FIXIE_URL;
    
    if (!fixieUrl) {
      return res.status(500).json({ error: 'FIXIE_URL não configurado corretamente' });
    }

    // Configurando o agente de proxy com a URL do Fixie
    const proxyAgent = new HttpsProxyAgent(fixieUrl);

    // Usando Axios para realizar a requisição via proxy
    const response = await axios.get('https://api64.ipify.org?format=json', {
      httpAgent: proxyAgent,  // Usando o agente de proxy com o Axios
    });

    return res.status(200).json({ ip: response.data.ip });
  } catch (error) {
    console.error('Erro ao obter o IP:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Erro ao obter o IP', details: errorMessage });
  }
};

export default handler;

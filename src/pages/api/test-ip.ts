import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { NextApiRequest, NextApiResponse } from 'next';
const fixieUrlString =  process.env.FIXIE_URL;


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!fixieUrlString) {
      return res.status(500).json({ error: 'FIXIE_URL não configurado' });
    }

    // Criando o agente proxy com a URL do FIXIE_URL
    const proxyAgent = new HttpsProxyAgent(fixieUrlString);

    // Realizando a requisição via proxy
    const response = await axios.get('https://api64.ipify.org?format=json', {
      httpsAgent: proxyAgent,  // Usando o agente de proxy com o Axios
    });

    return res.status(200).json({ ip: response.data.ip });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao obter o IP' });
  }
};

export default handler;

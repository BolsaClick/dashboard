import { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';
import Cors from 'cors'; 
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);



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
  if (req.method === 'POST') {
    const { email, firstName, city, state } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório' });
    }

    const data = {
      list_ids: ['157f46de-0019-47d0-97df-e27014b8868c'], 
      contacts: [
        {
          email:  email,
          first_name: firstName,
          custom_fields: {
            w1_T: city,    
            w2_T: state,   
          }
        }
      ]
    };

    try {
      const response = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        res.status(200).json({ message: 'Lead cadastrado com sucesso!' });
      } else {
        const errorData = await response.json();
        res.status(response.status).json({ error: errorData });
      }
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao cadastrar lead no SendGrid' });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}

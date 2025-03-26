import axios from 'axios';

// Verificando se a variável de ambiente FIXIE_URL está definida
const fixieUrlString = process.env.FIXIE_URL;

if (!fixieUrlString) {
  console.error('Erro: A variável de ambiente FIXIE_URL não está configurada corretamente.');
  throw new Error('FIXIE_URL não está configurado corretamente!');
}

let parsedFixieUrl: URL;

try {
  // Tentando criar a URL
  parsedFixieUrl = new URL(fixieUrlString);
} catch (error) {
  console.error('Erro: A URL fornecida para FIXIE_URL é inválida.');
  throw new Error('A URL fornecida para FIXIE_URL é inválida!');
}

// Criando a instância do Axios com configuração do proxy
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  },
  proxy: {
    host: parsedFixieUrl.hostname,
    port: Number(parsedFixieUrl.port), // A porta é convertida para número, com valor padrão 80 se não existir
    auth: {
      username: parsedFixieUrl.username,
      password: parsedFixieUrl.password,
    },
  },
});

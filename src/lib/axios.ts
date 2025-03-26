// src/lib/axios.ts
import axios from 'axios';

const fixieUrl = new URL(process.env.FIXIE_URL!)



export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json', 
  },
  proxy: {
    host: fixieUrl.hostname,
    port: Number(fixieUrl.port),
    auth: {
      username: fixieUrl.username,
      password: fixieUrl.password,
    },
  },
});


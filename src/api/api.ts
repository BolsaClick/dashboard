// api.ts
export async function fetchCommissionData() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InZlcmlmaWVkRW1haWwiOmZhbHNlLCJ2ZXJpZmllZFNNUyI6dHJ1ZSwidGVybUFncmVlbWVudCI6dHJ1ZSwiY3JlYXRlZEF0IjoiMjAyNC0xMC0yMVQxNDo0Nzo0MC45NTFaIiwidXBkYXRlZEF0IjoiMjAyNC0xMS0wNVQxMjo1OTozNC40NTFaIiwiZGVsZXRlZEF0IjpudWxsLCJiYWNrb2ZmaWNlQWNjZXNzIjp0cnVlLCJfaWQiOiI2NzE2Njk4Y2I0ZDMzYjAwMDhhMTgwMDEiLCJuYW1lIjoiUm9kcmlnbyBTb2FyZXMgU2lsdmVyaW8iLCJzb2NpYWxOYW1lIjoiSW5vdml0IERpZ2l0YWwiLCJnZW5yZSI6InByZWZpcm8gbsOjbyByZXNwb25kZXIiLCJlbWFpbCI6InJvZHJpZ28uc2lsdmVyaW9AaW5vdml0LmlvIiwiY3BmIjoiNDc4ODc0NzI4NjUiLCJwaG9uZSI6IjU1MTE5NDAzOTczODAiLCJiaXJ0aERhdGUiOiIxMC8wNC8xOTk4IiwicGFydG5lckNvbXBhbnkiOiI2NzEyOTlmNDk4ZGM1ZDAwMDgwN2I4ZGMiLCJwZXJtaXNzaW9uIjoiNjNmN2NjN2EyMmIwYWQwMDA4MmU2MmY1IiwiX192IjowfSwiaWF0IjoxNzQwNjYyMzMyLCJleHAiOjE3NDMyNTQzMzJ9.n9EdLPzIEXTlknBY2Dwpax_h3rbNXZWrke9QoI8T_gE';

  try {
    const response = await fetch('https://api.consultoriaeducacao.app.br/commission/listInstallmentsByPromoterDC/6716698cb4d33b0008a18001?limit=9999&page=1', {
      method: 'GET',
      headers: {
        'Authorization': `${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar dados');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

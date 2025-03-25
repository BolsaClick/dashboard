import twilio from 'twilio';

const accountSid = 'AC0470ec7693f40574f5cbcaa5b0272cc9';  
const authToken = '5a187521f0616f8586197144aec9a282';  
const client = twilio(accountSid, authToken);


export default async function sendWhatsAppMessage(phone: string, name: string, courseName: string) {
  try {
    const message = await client.messages.create({
      from: 'whatsapp:+15413667793', // Seu número Twilio configurado para WhatsApp
      to: `whatsapp:+55${phone}`,     // Número do destinatário
      body: `✨ Olá, ${name}!

Já identificamos a sua Inscrição Gratuita no curso ${courseName} para estudar com bolsa na Anhanguera!

🔹 Acesse o site da instituição e digite seu CPF para acompanhar sua inscrição: https://www.anhanguera.com/area-do-candidato/login

💡 Aproveite, as ofertas expiram rápido! Realize o pagamento da sua matrícula e garanta o preço visto.

📱 Precisa de ajuda? Inicie uma conversa no WhatsApp: https://wa.me/5511940063113

Equipe Bolsa Click - Estamos online de segunda a sexta, das 9h às 18h.

Vai de graduação ou pós? Bolsa Click!`

    });

  } catch (error) {
    console.error('Erro ao enviar mensagem no WhatsApp:', error);
  }
}
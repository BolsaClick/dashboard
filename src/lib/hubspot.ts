import axios from 'axios';

interface HubspotPayload {
  name: string;
  email: string;
  phone: string;
  courseName: string;
  courseId: string;
  offerId: string;
  amount: number;
  source?: string;
}

export async function submitToHubspot(payload: HubspotPayload) {
  const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID;
  const HUBSPOT_FORM_GUID = process.env.HUBSPOT_FORM_GUID;

  if (!HUBSPOT_PORTAL_ID || !HUBSPOT_FORM_GUID) {
    console.error('❌ Variáveis HUBSPOT_PORTAL_ID ou HUBSPOT_FORM_GUID não definidas.');
    return;
  }

  const HUBSPOT_API = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`;

  try {
    await axios.post(HUBSPOT_API, {
      fields: [
        { name: 'firstname', value: payload.name },
        { name: 'email', value: payload.email },
        { name: 'phone', value: payload.phone },
        { name: 'curso__c', value: payload.courseName },
        { name: 'id_do_curso__c', value: payload.courseId },
        { name: 'offerid__c', value: payload.offerId },
        { name: 'valor_da_bolsa__c', value: payload.amount.toString() },
        { name: 'origem__c', value: payload.source || 'checkout' },
      ]
    });
    console.log('✅ Enviado com sucesso para o HubSpot');
  } catch (error) {
    console.error(error);
  }
}

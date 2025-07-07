import axios from 'axios'

export interface HubspotLeadPayload {
  email: string
  cpf: string
  city: string
  state: string
  courseId: string
  courseName: string
  brand: string
  modality: string
  unitId: string
  phone: string
  name: string
  firstName: string
  offerId: string
  typeCourse: string
  paid: string
  cep: string
  channel: string
}

export async function sendLeadToHubspot(data: HubspotLeadPayload): Promise<string> {
  try {
    const response = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/contacts',
      {
        properties: {
          email: data.email,
          firstname: data.firstName || data.name,
          phone: data.phone,
          city: data.city,
          state: data.state,
          company: data.cep,
          cpf: data.cpf,
          jobtitle: data.brand,
          modality: data.modality,
          course_id: data.courseId,
          course_name: data.courseName,
          unit_id: data.unitId,
          offer_id: data.offerId,
          type_course: data.typeCourse,
          channel: data.channel,
          paid_status: data.paid || 'pending',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data.id // HubSpot contactId
  } catch (error: any) {
    const hubspotError = error?.response?.data

    // Trata erro de contato existente
    if (
      hubspotError?.status === 'error' &&
      hubspotError?.category === 'CONFLICT' &&
      hubspotError?.message?.includes('Contact already exists')
    ) {
      const match = hubspotError.message.match(/Existing ID: (\d+)/)
      const existingId = match?.[1]
      if (existingId) {
        console.warn(`Contato já existe. Usando ID existente: ${existingId}`)
        return existingId
      }
    }

    console.error('Erro ao enviar lead ao HubSpot:', hubspotError || error.message)
    throw new Error('Erro ao enviar lead ao HubSpot')
  }
}

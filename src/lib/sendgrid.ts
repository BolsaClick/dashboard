import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export const sendEmail = async (to: string, templateData: Record<string, any>) => {
  const msg = {
    to,
    from: process.env.FROM_EMAIL as string,
    templateId: process.env.SENDGRID_TEMPLATE_ID as string,
    dynamicTemplateData: templateData,  
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw new Error('Erro ao enviar e-mail.');
  }
};

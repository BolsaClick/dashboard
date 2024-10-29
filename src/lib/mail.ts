// lib/mail.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.URL_MAILTRAP, 
  port: 587,
  secure: false, 
  auth: {
    user: process.env.USER_MAILTRAP,
    pass: process.env.PASSWORD_MAILTRAP

  },
});
export default transporter;

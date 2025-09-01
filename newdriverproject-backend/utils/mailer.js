// utils/mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465, // 465 = TLS מלא
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, html, text }) {
  if (!to) {
    console.warn('sendMail: "to" is missing');
    return;
  }
  const mail = {
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: text || '',
    html: html || text || '',
  };
  return transporter.sendMail(mail);
}

module.exports = { sendMail };

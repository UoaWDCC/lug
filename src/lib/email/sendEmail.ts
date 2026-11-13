import nodemailer from "nodemailer";

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
};

// Sends one message. A new transporter per call is fine at <100 recipients (no pooling needed)
export async function sendEmail(email: OutgoingEmail): Promise<void> {
  const config = readSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    // Port 465 uses TLS from the start; other ports (587, Mailpit's 1025) upgrade with STARTTLS if offered
    secure: config.port === 465,
    // Mailpit needs no login, so only send credentials when they're set
    auth: config.user ? { user: config.user, pass: config.pass } : undefined,
  });

  await transporter.sendMail({
    from: config.from,
    to: email.to,
    subject: email.subject,
    html: email.html,
    text: email.text,
    headers: email.headers,
  });
}

function readSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const from = process.env.EMAIL_FROM;
  if (!host || !from) {
    throw new Error("SMTP_HOST and EMAIL_FROM must be set to send email");
  }

  return {
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from,
  };
}

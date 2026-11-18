import nodemailer from "nodemailer";

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function getEmailTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM } =
    process.env;
  const port = Number(SMTP_PORT);

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !EMAIL_FROM || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      "Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and EMAIL_FROM.",
    );
  }

  return {
    transport: nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    }),
    from: EMAIL_FROM,
  };
}

export async function sendEmail(message: EmailMessage) {
  const { transport, from } = getEmailTransport();
  await transport.sendMail({ from, ...message });
}

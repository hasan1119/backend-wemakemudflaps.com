import nodemailer, { Transporter } from "nodemailer";
import config from "../../config/config";

// Defines the structure for email options
interface EmailOptions {
  to: string;
  text: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using nodemailer with configured SMTP settings.
 *
 * Workflow:
 * 1. Creates a nodemailer transporter with SMTP host, port, and authentication details from config.
 * 2. Constructs the email with provided options (to, subject, text, html).
 * 3. Attempts to send the email and returns true on success or false on failure.
 *
 * @param options - Object containing email details.
 * @param options.to - Recipient's email address.
 * @param options.text - Plain text content of the email.
 * @param options.subject - Subject of the email.
 * @param options.html - HTML content of the email.
 * @returns A promise resolving to true if the email is sent successfully, false otherwise.
 */
const SendEmail = async ({
  to,
  text,
  subject,
  html,
}: EmailOptions): Promise<boolean> => {
  const transporter: Transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: false,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: config.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};

export default SendEmail;

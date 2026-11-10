import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass }
    });
  }
  return transporter;
}

export function isEmailConfigured() {
  return getTransporter() !== null;
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[dev-email-fallback] Password reset link for ${to}: ${resetUrl}`);
    return { delivered: false, devFallback: true };
  }

  await t.sendMail({
    from: env.smtp.from,
    to,
    subject: "Reset your Job Prep password",
    text: `Reset your password using this link (valid for 1 hour): ${resetUrl}`,
    html: `<p>Reset your password using the link below (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
  });
  return { delivered: true, devFallback: false };
}

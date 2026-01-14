import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html, replyTo }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }

  // Recommended: include a display name
  const from = process.env.FROM_EMAIL
    ? `Devboard <${process.env.FROM_EMAIL}>`
    : "Devboard <onboarding@resend.dev>";

  const payload = {
    from,
    to,
    subject,
    html,
    ...(replyTo ? { reply_to: replyTo } : {}),
  };

  const { data, error } = await resend.emails.send(payload);

  if (error) {
    // Log the full object so Render logs show the exact Resend reason
    console.error("Resend error (full):", error);
    throw new Error(error.message || "Email failed to send");
  }

  return data;
}
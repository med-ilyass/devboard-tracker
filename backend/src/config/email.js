import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
    const from = process.env.FROM_EMAIL || "onboarding@resend.dev"
    const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
    })
    if (error) {
        console.error("Resend error:", error);
        throw new Error("Email failed to send")
    }
    return data;
}
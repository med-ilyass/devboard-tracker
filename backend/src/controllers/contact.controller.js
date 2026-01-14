import { sendEmail } from "../config/email.js";

export async function sendContact(req, res) {

    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: "All fields are required." })
        }
        await sendEmail({
            to: process.env.SUPPORT_EMAIL, // your inbox
            subject: `Devboard Contact: ${subject}`,
            html: `
        <div style="font-family: Arial; line-height: 1.5">
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <hr/>
          <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
        </div>
      `,
        });

        // optional: auto-reply to sender
        await sendEmail({ to: process.env.SUPPORT_EMAIL, subject: `Devboard Contact: ${subject}`, replyTo: email, html });

        try {
            await sendEmail({ to: email, subject: "We received your message ✅", html: autoReplyHtml });
        } catch (err) {
            console.error("Auto-reply failed:", err.message);
        }

        return res.json({ message: "Sent" });

        return res.json({ message: "Sent" });
    } catch (error) {
        console.error("Contact error:", error.message);
        return res.status(500).json({ message: "Failed to send message." });
    }
}

// tiny safety helper (prevents HTML injection in emails)
function escapeHtml(str = "") {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
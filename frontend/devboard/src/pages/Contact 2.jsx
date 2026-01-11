import { useState } from "react";


export default function Contact() {
    const API_URL = import.meta.env.VITE_API_URL || "";
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);
    const [ok, setOk] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setOk("");
        setLoading(true);
        const form = new FormData(e.target);
        const name = form.get("name");
        const email = form.get("email");
        const subject = form.get("subject");
        const message = form.get("message");
        try {
            const res = await fetch(`${API_URL}/api/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, subject, message })
            })
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.message || "Failed ro send message")
            setOk("Message sent! We'll get back to you soon.");
            e.target.reset();
        } catch (error) {
            console.error(error.message || "Network Error")
        } finally {
            setLoading(false)
        }

    }
    return (
        <div className="page">
            <h1>Contact</h1>
            <p style={{ opacity: 0.8 }}>Send us a message and we'll reply by email.</p>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {ok && <p style={{ color: "green" }}>{ok}</p>}
            <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                    <label>Name</label>
                    <input name="name" required />
                </div>
                <div className="field">
                    <label>Email</label>
                    <input type="email" name="email" required />
                </div>
                <div className="field">
                    <label>Subject</label>
                    <input name="subject" required />
                </div>
                <div className="field">
                    <label>Message</label>
                    <textarea name="message" rows={5} required />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Sending ..." : "Send"}
                </button>
            </form>
        </div>
    )
}


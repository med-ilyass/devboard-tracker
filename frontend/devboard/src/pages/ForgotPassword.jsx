import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"
export default function ForgotPassword() {

    const [error, setError] = useState("");
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        const form = new FormData(e.target);
        const email = form.get("email");

        try {
            const res = await fetch("http://localhost:4000/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            // always show generic message
            if (!res.ok) {
                // optional: read backend message
                let data = null;
                try { data = await res.json(); } catch { }
                throw new Error(data?.message || "Request failed");
            }

            setMessage("If the email exists, we sent a code.");
            navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err) {
            setError(err.message || "Network error");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="page">
            <h1>Forgot Password</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "blue" }}>{message}</p>}

            <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                    <label>Email</label>
                    <input name="email" type="email" required />
                </div>
                <button type="submit" disabled={loading}>{loading ? "Sending ..." : "Send Code"}</button>
                <p style={{ marginTop: "1rem" }}>Back to <Link to="/login">Login</Link></p>
            </form>
        </div>

    );
};
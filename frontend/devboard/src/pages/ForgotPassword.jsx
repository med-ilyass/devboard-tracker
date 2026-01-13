import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../api/client.js";

export default function ForgotPassword() {
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
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
            await apiRequest("/api/auth/forgot-password", {
                method: "POST",
                body: { email },
            });

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
                <button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Code"}
                </button>
                <p style={{ marginTop: "1rem" }}>
                    Back to <Link to="/login">Login</Link>
                </p>
            </form>
        </div>
    );
}
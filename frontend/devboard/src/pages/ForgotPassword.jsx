import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"
import Snowfall from "react-snowfall"
export default function ForgotPassword() {

    const [error, setError] = useState("");
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true)
        setError("");
        setMessage("");

        const form = new FormData(e.target)
        const email = form.get("email")

        //let's connect ot back-end

        setMessage("If email exists, we sent a code.")
        setLoading(false)
        //let's pass the email to the next page using query params:
        navigate(`/reset-password?email${encodeURIComponent(email)}`)
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
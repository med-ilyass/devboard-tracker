import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Snowfall from "react-snowfall"

export default function Login({ onLogin }) {

    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        const form = new FormData(e.target);
        const email = form.get("email")
        const password = form.get("password")
        // console.log("Login attempt:", email, password)
        // prompt("Login attempt:", email, password)
        //later we send a request to the backend

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Invalid credentials");
                return;
            }
            console.log("Login success:", data)
            onLogin(data.user, data.token)
            navigate("/")
        } catch (error) {
            console.error({ error: "Network Error" })
            setError("Network Error!!!")
        }
    }

    return (
        <div className="page">
            <h1>Login</h1>
            {
                error && <p style={{ color: "red" }}>{error}</p>
            }
            <form onSubmit={handleSubmit} className="form">
                <div className="field">
                    <label>Email</label>
                    <input name="email" type="email" required />
                </div>
                <div className="field">
                    <label>Password</label>
                    <input type="password" name="password" required />
                </div>
                <button type="submit">Login</button>
            </form>
            <p style={{ marginTop: "1rem" }}>New User? <Link to="/register" >Create Account</Link></p>
            <p style={{ marginTop: "1rem" }}><Link to="/forgot-password">Forget Password?</Link></p>
        </div >
    );
}
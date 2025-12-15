
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";


export default function Register({ onLogin }) {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("")
        setLoading(true)

        const form = new FormData(e.target);
        const name = form.get("name")
        const email = form.get("email")
        const password = form.get("password")
        const confirmPassword = form.get("confirm_password")

        if (password.trim() !== confirmPassword.trim()) {
            //will add a condition
            // won't create account until password is same as confirm password
            setError("passwords do not match")
            setLoading(false)
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Registration failed")
                return;
            }

            onLogin(data.user, data.token)
            navigate("/")
        } catch (error) {
            console.error(error);
            setError("Network Error!")
        } finally {
            setLoading(false)
        }

    }




    return (
        <div className="page">
            {error && <p style={{ color: "red" }}>{error}</p>}
            <h1>Register</h1>
            <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                    <label>Name</label>
                    <input type="text" name="name" required />
                </div>
                <div className="field">
                    <label>Email</label>
                    <input type="email" name="email" required />
                </div>
                <div className="field">
                    <label>Password</label>
                    <input type="password" name="password" required />
                </div>
                <div className="field">
                    <label>Confirm Password</label>
                    <input type="password" name="confirm_password" required />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Creating acoount..." : "Create Account"}
                </button>
            </form>
            <p style={{ marginTop: "1rem" }}>Already have an Account? <Link to="/login" >Login</Link></p>
        </div>
    );
}
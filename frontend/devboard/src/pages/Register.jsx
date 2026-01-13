import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../api/client.js";

export default function Register({ onLogin }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("devboard_token");
  console.log("BASE_URL =", import.meta.env.VITE_API_URL);
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.target);
    const name = form.get("name");
    const email = form.get("email");
    const password = form.get("password");
    const confirmPassword = form.get("confirm_password");

    if (String(password).trim() !== String(confirmPassword).trim()) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest("/api/auth/register", {
        method: "POST",
        body: { name, email, password },
      });

      // auto login after register
      onLogin(data.user, data.token);
      navigate("/projects");
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  if (token) {
    return (
      <div className="page auth">
        <div className="card auth-card">
          <h1>You’re already logged in</h1>
          <p className="muted">Go to your projects.</p>
          <Link className="btn primary" to="/projects">
            Go to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page auth">
      <div className="card auth-card">
        <div className="auth-header">
          <h1>Create account</h1>
          <p className="muted">Join Devboard and start organizing work.</p>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input name="name" placeholder="Your name" required />
          </div>

          <div className="field">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@example.com" required />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="At least 12 characters"
              minLength={12}
              required
            />
          </div>

          <div className="field">
            <label>Confirm Password</label>
            <input
              name="confirm_password"
              type="password"
              placeholder="Repeat password"
              minLength={12}
              required
            />
          </div>

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-links">
          <p className="muted">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
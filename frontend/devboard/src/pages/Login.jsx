import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../api/client.js";

export default function Login({ onLogin }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("devboard_token");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.target);
    const email = form.get("email");
    const password = form.get("password");

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

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
          <h1>You're already logged in</h1>
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
          <h1>Welcome back</h1>
          <p className="muted">Log in to manage your projects and tasks.</p>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@example.com" required />
          </div>

          <div className="field">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••••••" required />
          </div>

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-links">
          <p className="muted">
            New user? <Link to="/register">Create account</Link>
          </p>
          <p className="muted">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
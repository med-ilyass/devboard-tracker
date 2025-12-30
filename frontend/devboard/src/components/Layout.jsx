import { Outlet, useNavigate, Link } from "react-router-dom";

export default function Layout({ user, setUser, setToken }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("devboard_token");

  function handleLogout() {
    localStorage.removeItem("devboard_user");
    localStorage.removeItem("devboard_token");
    setUser(null);
    setToken(null);
    navigate("/login");
  }

  const greeting =
    user?.name ? `Hi ${user.name}` : user?.email ? `Hi ${user.email}` : "Logged in";

  return (
    <div>
      <header style={{ padding: "12px 16px", borderBottom: "1px solid #ddd" }}>
        <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/">Home</Link>

          {token ? (
            <>
              <Link to="/projects">Projects</Link>

              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <span>{greeting}</span>
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          )}
        </nav>
      </header>

      <main style={{ padding: "16px" }}>
        <Outlet />
      </main>
    </div>
  );
}
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export default function Layout({ user, setUser, setToken }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("devboard_token");

  function handleLogout() {
    localStorage.removeItem("devboard_token");
    localStorage.removeItem("devboard_user");
    setUser(null);
    setToken(null);
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <Navbar user={user} token={token} onLogout={handleLogout} />

      <main className="main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
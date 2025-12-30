import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

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

  return (
    <>
      <Navbar
        user={user}
        token={token}
        onLogout={handleLogout}
      />

      <main className="page">
        <Outlet />
      </main>
    </>
  );
}
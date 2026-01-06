import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, token, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          Devboard
        </Link>
      </div>

      <div className="navbar-right">
        <Link to="/contact">Contact</Link>
        {token ? (
          <>
            <Link to="/projects">Projects</Link>
            <span className="user">
              {user?.name || user?.email}
            </span>
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}
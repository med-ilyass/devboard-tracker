import { Link } from "react-router-dom";

export default function Navbar({ user, token, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          Devboard
        </Link>

        {/* left links (optional) */}
        <nav className="nav-left">
          {token && <Link to="/projects">Projects</Link>}
        </nav>

        {/* right links */}
        <nav className="nav-right">
          <Link to="/contact">Contact</Link>

          {token ? (
            <>
              <span className="user-pill" title={user?.email}>
                {user?.name || user?.email || "Logged in"}
              </span>
              <button className="btn ghost" type="button" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn ghost" to="/login">
                Login
              </Link>
              <Link className="btn primary" to="/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
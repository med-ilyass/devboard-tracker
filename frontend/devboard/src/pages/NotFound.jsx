import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page not-found">
      <div className="nf-card">
        <div className="nf-code">404</div>

        <h1 className="nf-title">Page not found</h1>

        <p className="nf-text">
          The page you’re looking for doesn’t exist, or you don’t have permission
          to access it.
        </p>

        <div className="nf-actions">
          <Link to="/" className="btn btn-primary">
            Go home
          </Link>
          <Link to="/projects" className="btn btn-ghost">
            My projects
          </Link>
        </div>
      </div>
    </div>
  );
}
import { Link } from "react-router-dom";

export default function Home() {
  const token = localStorage.getItem("devboard_token")
  return (
    <div className="home">
      <section className="hero container">
        <div className="hero-left">
          <p className="pill">Devboard • Projects • Tasks • Sharing</p>

          <h1 className="hero-title">
            Build projects.
            <br />
            Track tasks.
            <br />
            Collaborate with roles.
          </h1>

          <p className="hero-subtitle">
            A modern project tracker where you can create projects, assign members,
            and control permissions (owner / editor / viewer).
          </p>

          <div className="hero-actions">
            {token ? (
              <Link to="/projects" className="btn btn-primary">
                Go to projects
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get started
                </Link>
                <Link to="/login" className="btn btn-ghost">
                  Log in
                </Link>
              </>
            )}
          </div>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">Roles</div>
              <div className="stat-label">Owner / Editor / Viewer</div>
            </div>
            <div className="stat">
              <div className="stat-num">Secure</div>
              <div className="stat-label">JWT + Email reset</div>
            </div>
            <div className="stat">
              <div className="stat-num">Fast</div>
              <div className="stat-label">React + Node + Postgres</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="mock">
            <div className="mock-top">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
              <span className="mock-title">Devboard</span>
            </div>

            <div className="mock-body">
              <div className="mock-card">
                <div className="mock-card-title">Website Launch</div>
                <div className="mock-row">
                  <span className="badge badge-blue">in progress</span>
                  <span className="badge badge-purple">high</span>
                </div>
                <div className="mock-line" />
                <div className="mock-line short" />
              </div>

              <div className="mock-card">
                <div className="mock-card-title">API Integration</div>
                <div className="mock-row">
                  <span className="badge badge-gray">backlog</span>
                  <span className="badge badge-green">medium</span>
                </div>
                <div className="mock-line" />
                <div className="mock-line short" />
              </div>

              <div className="mock-card">
                <div className="mock-card-title">QA & Permissions</div>
                <div className="mock-row">
                  <span className="badge badge-green">done</span>
                  <span className="badge badge-gray">low</span>
                </div>
                <div className="mock-line" />
                <div className="mock-line short" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features container">
        <h2 className="section-title">What you can do</h2>
        <p className="section-subtitle">
          Everything you need for a clean workflow — without the clutter.
        </p>

        <div className="grid">
          <div className="feature-card">
            <h3>Projects</h3>
            <p>Create and manage projects with status and descriptions.</p>
          </div>
          <div className="feature-card">
            <h3>Tasks</h3>
            <p>Add tasks with priority and status. Keep everything organized.</p>
          </div>
          <div className="feature-card">
            <h3>Sharing</h3>
            <p>Invite members by email and choose editor/viewer roles.</p>
          </div>
          <div className="feature-card">
            <h3>Security</h3>
            <p>JWT auth + email password reset flow (Resend).</p>
          </div>
        </div>
      </section>
    </div>
  );
}
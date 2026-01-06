import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProjects, createProject, deleteProject } from "../api/projects";

export default function Projects() {
  const navigate = useNavigate();
  const token = localStorage.getItem("devboard_token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await getProjects(token);
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, navigate]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setCreating(true);

    const form = new FormData(e.target);
    const name = form.get("name");
    const description = form.get("description");

    try {
      const newProject = await createProject(token, { name, description });
      setProjects((prev) => [newProject, ...prev]);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleArchive(projectId) {
    setError("");
    try {
      await deleteProject(token, projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">Projects</h1>
        <p className="page-subtitle">Create, share, and manage your work.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-head">
          <h2 className="card-title">Create project</h2>
          <p className="card-subtitle">Start a new project and invite collaborators.</p>
        </div>

        <form className="form" onSubmit={handleCreate}>
          <div className="form-row">
            <div className="field">
              <label>Name</label>
              <input name="name" placeholder="e.g. Devboard MVP" required />
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Short description (optional)"
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>

      <div className="section-spacer" />

      {loading ? (
        <div className="card">
          <p className="muted">Loading projects…</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="card">
          <p className="muted">No projects yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => (
            <div key={p.id} className="project-tile">
              <Link to={`/projects/${p.id}`} className="project-link">
                <div className="project-top">
                  <h3 className="project-name">{p.name}</h3>

                  {/* role badge (owner/editor/viewer) */}
                  {p.my_role && (
                    <span className={`badge badge-${p.my_role}`}>
                      {p.my_role}
                    </span>
                  )}
                </div>

                {p.description ? (
                  <p className="project-desc">{p.description}</p>
                ) : (
                  <p className="project-desc muted">No description.</p>
                )}

                <div className="project-meta">
                  <span className={`pill pill-${p.status || "active"}`}>
                    {p.status || "active"}
                  </span>
                </div>
              </Link>

              {/* only owner can archive */}
              {p.my_role === "owner" && (
                <div className="project-actions">
                  <button
                    className="btn btn-danger btn-sm"
                    type="button"
                    onClick={() => handleArchive(p.id)}
                  >
                    Archive
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
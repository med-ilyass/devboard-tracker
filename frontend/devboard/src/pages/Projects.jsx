import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProjects, createProject, deleteProject } from "../api/projects";

export default function Projects() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("");
    const [projects, setProjects] = useState([])
    const [creating, setCreating] = useState(false)
    const token = localStorage.getItem("token")


    useEffect(() => {
        if (!token) {
            navigate("/login")
            return;
        }
        async function load() {
            try {
                // first we call getProjects(token)
                const data = await getProjects(token);
                // then second we setProject
                setProjects(data)
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [token, navigate])

    // two functions we be needed handle create project (handleCreate) and delete project handleArchive 
    async function handleCreate(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const form = new FormData(e.target);
        const name = form.get("name");
        const description = form.get("description");

        try {
            const newProject = await createProject(token, { name, description })
            setProjects((prev) => [newProject, ...prev])
            e.target.reset()
        } catch (error) {
            setError(error.message)
        } finally {
            setCreating(false)
        }

    }
    async function handleArchive(projectId) {
        setLoading(false)
        setError("")
        try {
            await deleteProject(token, projectId)
            setProjects((prev) => prev.filter((p) => p.id !== projectId))
        } catch (error) {
            setError(error.message)
        }
    }




    return (
        <div className="page">
            <h1>Projects</h1>
            {error && <p style={{ color: " red" }}>{error}</p>}
            <form className="form" onSubmit={handleCreate}>
                <div className="field">
                    <label>Name:</label>
                    <input name="name" required />
                    <label>Description:</label>
                    <textarea name="description" rows={3} />
                </div>
                <button type="submit" disabled={creating}>{creating ? "Creating...." : "Create Project"}</button>
            </form>
            <hr style={{ margin: "1rem 0" }} />
            {loading ? (<p>Loading ...</p>) : projects.length === 0 ? <p>No project yet.</p> : (
                <ul>
                    {projects.map((p) => (<li key={p.id} style={{ marginBottom: "1rem" }} >
                        <strong>{p.name}</strong>
                        <div>{p.description}</div>
                        <small>Status : {p.status}</small>
                        <div>
                            <button onClick={() => { handleArchive(p.id) }}>Archive</button>
                        </div>
                    </li>))}
                </ul>
            )
            }
        </div>
    );
}
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getProjectById } from "../api/projects.js";
import { createTask, deleteTask, updateTask, getTasks } from "../api/tasks.js";

export default function ProjectDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const token = localStorage.getItem("devboard_token"); // ✅ define token here
    const projectId = Number(id);
    //page state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("")
    //data state 
    const [project, setProject] = useState(null)
    const [tasks, setTasks] = useState([])
    //form state
    const [creatingTask, setCreatingTask] = useState(false)
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        priority: "medium",
        status: "backlog"
    });
    const [savingEdit, setSavingEdit] = useState(false)
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        if (Number.isNaN(projectId)) {
            setError("Invalid project id.");
            return;
        }

        async function load() {
            try {
                setLoading(true);
                setError("");

                const proj = await getProjectById(token, projectId);
                setProject(proj);

                const ts = await getTasks(token, projectId);
                setTasks(ts);
            } catch (err) {
                // if JWT expired, force login
                if (String(err.message).toLowerCase().includes("expired")) {
                    localStorage.removeItem("devboard_token");
                    localStorage.removeItem("devboard_user");
                    navigate("/login");
                    return;
                }
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [token, navigate, projectId]);

    function startEdit(task) {
        setEditingTaskId(task.id);
        setEditForm({
            title: task.title ?? "",
            description: task.description ?? "",
            priority: task.priority ?? "medium",
            status: task.status ?? "backlog",
        });
    }
    function cancelEdit() {
        setEditingTaskId(null);
    }
    async function handleSaveEdit(taskId) {
        setError("");
        setSavingEdit(true);

        try {
            const updated = await updateTask(token, taskId, {
                title: editForm.title,
                description: editForm.description,
                priority: editForm.priority,
                status: editForm.status,
            });

            // update UI list
            setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
            setEditingTaskId(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setSavingEdit(false);
        }
    }
    async function handleCreatetask(e) {
        e.preventDefault();
        setError("");
        setCreatingTask(true)
        const form = new FormData(e.target);
        const title = form.get("title");
        const description = form.get("description")
        const priority = form.get("priority")
        //read fileds from form
        //title, description, priority, due_date (optional)
        try {
            //call createTask(token, playload)
            //then update task list: setTasks((prev) => [\newTask, ...prev])
            //reset Form 
            const newTask = await createTask(token, {
                project_id: projectId,
                title,
                description,
                priority,
            })
            setTasks((prev) => [newTask, ...prev])
            e.target.reset();
        } catch (error) {
            setError(error.message)
        } finally {
            setCreatingTask(false)
        }

    }

    async function handleDeleteTask(taskId) {
        setError("")
        try {
            //call deleteTask(token, taskId)
            //remove from UI: setTasks((prev) => prev.filter(t => t.id !== taskId))
            await deleteTask(token, taskId)
            setTasks((prev) => prev.filter((t) => t.id !== taskId))
        } catch (error) {
            setError(error.message)
        }
    }


    return (
        <div className="page">
            <p>
                <Link to="/projects">← Back to Project</Link>
            </p>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {loading ? (<p>Loading ...</p>) : !project ? (<p>Project not found!</p>) : (
                <>
                    <h1>{project.name}</h1>
                    {project.description && <p>{project.description}</p>}
                    <small>Status: {project.status}</small>
                    <hr style={{ margin: "1rem 0" }} />
                    <h2>Tasks</h2>
                    <form className="form" onSubmit={handleCreatetask} >
                        <div className="field">
                            <label>Title</label>
                            <input name="title" required />
                        </div>
                        <div className="field">
                            <label>Description:</label>
                            <textarea name="description" rows={3} required />
                        </div>
                        <div className="field" >
                            <label>Priority </label>
                            <select name="priority" defaultValue="medium">
                                <option value="low">low</option>
                                <option value="medium">medium</option>
                                <option value="high">high</option>
                            </select>
                        </div>
                        <button type="submit" disabled={creatingTask}>
                            {creatingTask ? "Adding..." : "Add Task"}
                        </button>
                    </form>
                    <hr style={{ margin: "1rem 0" }} />
                    {tasks.length === 0 ? (<p>No Task yet.</p>) : (
                        <>
                            <ul>
                                {tasks.map((t) => (
                                    <li key={t.id} style={{ marginTop: "1rem" }}>
                                        {editingTaskId === t.id ? (
                                            <>
                                                <div className="field">
                                                    <label>Title</label>
                                                    <input
                                                        value={editForm.title}
                                                        onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                                                    />
                                                </div>

                                                <div className="field">
                                                    <label>Description</label>
                                                    <textarea
                                                        rows={3}
                                                        value={editForm.description}
                                                        onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                                                    />
                                                </div>

                                                <div className="field">
                                                    <label>Status</label>
                                                    <select
                                                        value={editForm.status}
                                                        onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                                                    >
                                                        <option value="backlog">backlog</option>
                                                        <option value="in_progress">in progress</option>
                                                        <option value="done">done</option>
                                                    </select>
                                                </div>

                                                <div className="field">
                                                    <label>Priority</label>
                                                    <select
                                                        value={editForm.priority}
                                                        onChange={(e) => setEditForm((p) => ({ ...p, priority: e.target.value }))}
                                                    >
                                                        <option value="low">low</option>
                                                        <option value="medium">medium</option>
                                                        <option value="high">high</option>
                                                    </select>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={savingEdit}
                                                    onClick={() => handleSaveEdit(t.id)}
                                                >
                                                    {savingEdit ? "Saving..." : "Save"}
                                                </button>

                                                <button type="button" onClick={cancelEdit} disabled={savingEdit}>
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <strong>{t.title}</strong>
                                                {t.description && <div>{t.description}</div>}
                                                <small>
                                                    Status: {t.status} | Priority: {t.priority}
                                                </small>

                                                <div>
                                                    <button type="button" onClick={() => startEdit(t)}>
                                                        Edit
                                                    </button>

                                                    <button type="button" onClick={() => handleDeleteTask(t.id)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </>
            )}
        </div >
    )


}
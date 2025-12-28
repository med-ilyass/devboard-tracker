import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

//importing getProjectById from api/projects
//importing tasks, createTasks and deleteTask from api/tasks

export default function ProjectDetails() {

    const navigate = useNavigate();
    const { projectId } = useParams();
    const token = localStorage.getItem("token")

    //page state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("")

    //data state 
    const [project, setProject] = useState(null)
    const [tasks, setTasks] = useState([])

    //form state
    const [creatingTask, setCreatingTask] = useState(false)

    useEffect(() => {
        if (!token) {
            navigate("/login")
            return;
        }
        //validate projectId is a number
        const id = Number(projectId)
        if (Number.isNaN(id)) {
            setError("Invalid project id.")
            return;
        }
        async function load() {
            try {
                setLoading(true)
                setError("")
                //1- load project
                //const proj = await getProhectById(token, id)
                //setProject(proj)

                //2- load tasks for this project
                //const ts = await getTasks(token, id)
                //setTasks(ts)
            } catch (error) {
                setError(error)
            } finally {
                setLoading(false)
            }
        }
        load();
    }, [token, navigate, projectId])

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
        } catch (error) {
            setError(error)
        } finally {
            setCreatingTask(false)
        }

    }

    async function handleDeleteTask(taskId) {
        setError("")
        try {
            //call deleteTask(token, taskId)
            //remove from UI: setTasks((prev) => prev.filter(t => t.id !== taskId))
        } catch (error) {
            setError(error)
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
                            <label>Priority</label>
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
                                {tasks.map((t) => {
                                    <li key={t.id} style={{ marginTop: "1rem" }}>
                                        <strong>{t.title}</strong>
                                        {t.description && <div>{t.description}</div>}
                                        <small>
                                            Status : {t.status} | Priority : {t.priority}
                                        </small>
                                        <div>
                                            <button type="submit" onClick={() => handleDeleteTask(t.id)}>Delete</button>
                                        </div>
                                    </li>
                                })}
                            </ul>
                        </>
                    )}
                </>
            )}
        </div >
    )


}
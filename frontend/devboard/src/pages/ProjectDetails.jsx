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
    const [creatingForm, setCreatingForm] = useState(false)

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



}
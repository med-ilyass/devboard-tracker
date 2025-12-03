import express from "express"
import cors from "cors"

import authRoutes from "./routes/auth.routes.js"
import projectsRoutes from "./routes/projects.routes.js"
import tasksRoutes from "./routes/tasks.routes.js"
//import usersRoutes from "./routes/users.routes"

const app = express();
const PORT = 4000;

app.use(cors())
app.use(express.json())

//to test route
app.get("/", (req, res) => {
    res.json({ message: "Backend is running" });
})

app.use("/api/auth", authRoutes)
app.use("/api/projects", projectsRoutes)
app.use("/api/tasks", tasksRoutes)

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
}) 
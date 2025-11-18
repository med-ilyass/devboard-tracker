const express = require("express")
const cors = require("cors")

const authRoutes = require("./routes/auth.routes")
const projectsRoutes = require("./routes/projects.routes")
const tasksRoutes = require("./routes/tasks.routes")
//const usersRoutes = require("./routes/users.routes")

const app = express();
const PORT = 4000;

app.use(cors())
app.use(express.json())

//to test route
app.get("/", (req, res) => {
    res.json({ message: "Backend is running" });
})

app.use("/api/auth", authRoutes)
app.use("api/projects", projectsRoutes)
app.use("api/tasks", tasksRoutes)

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
}) 
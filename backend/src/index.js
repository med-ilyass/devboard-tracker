import express from "express"
import cors from "cors"

import authRoutes from "./routes/auth.routes.js"
import projectsRoutes from "./routes/projects.routes.js"
import tasksRoutes from "./routes/tasks.routes.js"
import contactRoutes from "./routes/contact.routes.js";
import usersRouter from "./routes/users.routes.js"



const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://devboard-tracker.vercel.app", 
  ],
  credentials: false,
}));
app.use(express.json());
app.use(express.json())

//to test route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
})
app.use("/api/auth", authRoutes)
app.use("/api/projects", projectsRoutes)
app.use("/api/tasks", tasksRoutes)
app.use("/api/contact", contactRoutes);
app.use("/api/users", usersRouter)


app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on ${PORT}`);
});

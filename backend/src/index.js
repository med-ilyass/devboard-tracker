import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import usersRouter from "./routes/users.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin === "http://localhost:5173") return callback(null, true);
    if (origin === "https://devboard-tracker.vercel.app") return callback(null, true);
    if (origin.endsWith(".vercel.app")) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", usersRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on ${PORT}`);
});
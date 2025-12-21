import { Router } from "express";
import { getTasks, getTaskById, updateTask, deleteTask, createTask } from "../controllers/tasks.controller.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

//all routes below this require auth
router.use(authMiddleware)

//all tasks
router.get("/", getTasks);
router.get("/:taskId", getTaskById);
router.post("/", createTask);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router; 
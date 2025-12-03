import { Router } from "express";
import { getTasks, getTaskById, updateTask, deleteTask, createTask } from "../controllers/tasks.controller.js";

const router = Router();

//all tasks
router.get("/", getTasks);
router.get("/:taskId", getTaskById);
router.post("/", createTask);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
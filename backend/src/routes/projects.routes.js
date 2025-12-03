import { Router } from "express";

import { getProjects, createProject, getProjectById, updateProject, deleteProject } from "../controllers/projects.controller.js";

const router = Router();

//List all project of the user
router.get("/", getProjects);

//Create a new Project
router.post("/", createProject)

//get a single project
router.get("/:projectId", getProjectById)

//update project
router.patch("/:projectId", updateProject)

//delete project
router.delete("/:projectId", deleteProject)

export default router;

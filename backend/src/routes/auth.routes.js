import { Router } from "express"
//importt controller functions
import { register, login, getMe } from "../controllers/auth.controller.js"

const router = Router();

//POST /api/auth/register
router.post("/register", register)

//POST /api/auth/login
router.post("/login", login)

//GET /api/auth/me
router.get("/me", getMe)

export default router;




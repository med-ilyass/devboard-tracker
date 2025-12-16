import { Router } from "express"
//importt controller functions
import { register, login, getMe } from "../controllers/auth.controller.js"
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

//POST /api/auth/register
router.post("/register", register)

//POST /api/auth/login
router.post("/login", login)

//GET /api/auth/me
//protecting the route, adding auth middle ware
router.get("/me", authMiddleware, getMe)

router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.post("/verify-reset-code", verifyResetCode)

export default router;




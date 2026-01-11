import { Router } from "express"
import authMiddleware from "../middleware/auth.js";
import {searchUsers} from "../controllers/users.controller.js"
const router = Router();

router.use(authMiddleware);
router.get("/search", searchUsers)

export default router;

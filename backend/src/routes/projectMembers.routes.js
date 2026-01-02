import { Router } from "express"
import authMiddleware from "../middleware/auth.js";
import { listMembers, addMember, removeMember } from "../controllers/projectMembers.controller.js";

const router = Router({ mergeParams: true });
router.use(authMiddleware);
router.get("/", listMembers);
router.post("/", addMember);
router.delete("/:userId", removeMember);
export default router;
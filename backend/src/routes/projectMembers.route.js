import { Router } from "express"
import authMiddleware from "../middleware/auth.js";
import { listMembers, addMember, removeMember } from "../controllers/projectMembers.controller";

const router = Router();
router.use(authMiddleware);

router.get("/:projectId/members", listMembers);
router.post("/:projectId/members", addMember);
router.delete("/:projectId/members/userId", removeMember);

export default router;
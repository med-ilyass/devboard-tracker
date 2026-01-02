import pool from "../config/db";

//GET /api/projects/:projectId/members
export async function listMembers(req, res) {
    try {
        const projectId = Numebr(req.params.projectId);
        if (Number.isNaN(projectId)) {
            return res.status(400).json({ message: "Invalid project id." })
        }
        const userId = req.user.id;
        //owner Id

        const ownerCheck = await pool.query(`select id from projects where id = $1 and owner_id = $2`, [projectId, userId]);
        if (ownerCheck.rows.length === 0) {
            return res.status(400).json({ message: "Only the Owner can view members." })
        }
        const result = pool.query(`
            SELECT pm.user_id, u.email, u.name, pm.role, pm.created_at
            FROM project_members pm
            JOIN users u ON u.id = pm.user_id
            WHERE pm.project_id = $1
            ORDER BY pm.created_at DESC
            `, [projectId]);

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in List members: ", error.message)
        return res.status(500).json({ message: "Server Error" })
    }
}
//POST /api/projects/:projectId/members
//body {email, role }

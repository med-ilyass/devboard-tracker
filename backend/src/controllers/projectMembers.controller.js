import pool from "../config/db.js";

function isValidRole(role) {
    return role === "viewer" || role === "editor"
}
//GET /api/projects/:projectId/members
export async function listMembers(req, res) {
    try {
        const projectId = Number(req.params.projectId);
        if (Number.isNaN(projectId)) {
            return res.status(400).json({ message: "Invalid project id." })
        }
        const userId = req.user.id;
        //owner Id

        const ownerCheck = await pool.query(`select id from projects where id = $1 and owner_id = $2`, [projectId, userId]);
        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({ message: "Only the Owner can view members." })
        }
        const result = await pool.query(`
            SELECT pm.user_id, u.email, u.name, pm.role, pm.created_at
            FROM project_members pm
            JOIN users u ON u.id = pm.user_id
            WHERE pm.project_id = $1
            ORDER BY pm.created_at DESC
            `, [projectId]);

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error in List members: ", error.message)
        return res.status(500).json({ message: "Server Error" })
    }
}
//POST /api/projects/:projectId/members
//body {email, role }
export async function addMember(req, res) {
    try {
        const projectId = Number(req.params.projectId)
        if (Number.isNaN(projectId)) {
            return res.status(400).json({ message: "Invalid project id" })
        }
        const ownerId = req.user.id;
        const { email, role } = req.body;
        if (!email || !role) {
            return res.status(400).json({ message: "Email and role are required" })
        }
        if (!isValidRole(role)) {
            return res.status(400).json({ message: "role must be viewer or editor" })
        }
        //owner only

        const ownerCheck = await pool.query(`select id from projects where id = $1 and owner_id = $2`, [projectId, ownerId])
        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({ message: "Only the owner can add members." })
        }
        //finding the user by his email
        const userRes = await pool.query(`Select id, email, name FROM users WHERE email = $1`, [email]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: "User with that email not found" })
        }
        const memberUserId = userRes.rows[0].id;
        //In case owner wants to add him self as a member -- even though I will prevent having the owner on the list
        if (memberUserId === ownerId) {
            return res.status(400).json({ message: "Owner is already the owner cannot be added as member" })
        }
        const upsert = await pool.query(`
            INSERT INTO project_members (project_id, user_id, role)
            VALUES ($1, $2, $3)
            ON CONFLICT (project_id, user_id)
            DO UPDATE SET role = EXCLUDED.role
            RETURNING project_id, user_id, role, created_at
            `, [projectId, memberUserId, role]);

        return res.status(201).json({
            message: "Member added/updated",
            member: {
                ...upsert.rows[0],
                email: userRes.rows[0].email,
                name: userRes.rows[0].name,
            },
        })
    } catch (error) {
        console.error("Error adding new member: ", error.message)
        return res.status(500).json({ message: "Server Error" })
    }
}
//DELETE /api/projects/:projectId/members/:userId (Owner Only)
export async function removeMember(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    const memberUserId = Number(req.params.userId);

    if (Number.isNaN(projectId) || Number.isNaN(memberUserId)) {
      return res.status(400).json({ message: "Invalid Id." });
    }

    const ownerId = req.user.id;

    const ownerCheck = await pool.query(
      `SELECT id FROM projects WHERE id = $1 AND owner_id = $2`,
      [projectId, ownerId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ message: "Only the owner can remove members." });
    }

    const del = await pool.query(
      `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING user_id`,
      [projectId, memberUserId]
    );

    if (del.rows.length === 0) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.json({ message: "Member removed" });
  } catch (error) {
    console.error("Error removing member:", error.message);
    return res.status(500).json({ message: "Server Error" });
  }
}
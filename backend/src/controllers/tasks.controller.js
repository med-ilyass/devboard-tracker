import pool from "../config/db.js";
//get all tasks
async function getProjectAccess(pool, projectId, userId) {
    const result = await pool.query(`
        SELECT
        p.id,
        p.owner_id,
      CASE
        WHEN p.owner_id = $2 THEN 'owner'
        ELSE pm.role::text
      END AS my_role
    FROM projects p
    LEFT JOIN project_members pm
      ON pm.project_id = p.id AND pm.user_id = $2
    WHERE p.id = $1
    LIMIT 1
        `, [projectId, userId]);

    if (result.rows.length === 0) {
        return { exists: false, my_role: null }
    }
    const row = result.rows[0];
    //adding statement if not owner and no membership role => no access
    const hasAccess = row.my_role === "owner" || row.my_role === "viewer" || row.my_role === "editor"
    return { exists: true, hasAccess, my_role: row.my_role }
}
function canWrite(role) {
    return role === "owner" || role === "editor";
}
export async function getTasks(req, res) {
    try {
        const userId = req.user.id;
        const { projectId } = req.query;

        // If projectId is provided: verify access to that project
        if (projectId) {
            const pid = Number(projectId);
            if (Number.isNaN(pid)) {
                return res.status(400).json({ message: "Invalid project id in query" });
            }

            const access = await getProjectAccess(pool, pid, userId);
            if (!access.exists) return res.status(404).json({ message: "Project not found" });
            if (!access.hasAccess) return res.status(403).json({ message: "You don’t have access to this project." });

            const result = await pool.query(
                `
        SELECT id, project_id, title, description, status, priority,
               created_by, assigned_to, due_date, created_at, updated_at
        FROM tasks
        WHERE project_id = $1
        ORDER BY created_at DESC
        `,
                [pid]
            );

            return res.json(result.rows);
        }

        // If no projectId: return tasks across all projects user can access (owner OR member)
        const result = await pool.query(
            `
      SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
             t.created_by, t.assigned_to, t.due_date, t.created_at, t.updated_at
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
      LEFT JOIN project_members pm
        ON pm.project_id = p.id AND pm.user_id = $1
      WHERE p.owner_id = $1 OR pm.user_id = $1
      ORDER BY t.created_at DESC
      `,
            [userId]
        );

        return res.json(result.rows);
    } catch (err) {
        console.error("Failed getting Tasks", err.message);
        return res.status(500).json({ message: "Failed fetching tasks" });
    }
}
//get tasks by id
export async function getTaskById(req, res) {
    try {
        const userId = req.user.id;
        const taskId = Number(req.params.taskId);

        if (Number.isNaN(taskId)) {
            return res.status(400).json({ message: "Invalid task id" });
        }

        // First get task + its project_id
        const taskRes = await pool.query(
            `
      SELECT id, project_id, title, description, status, priority,
             created_by, assigned_to, due_date, created_at, updated_at
      FROM tasks
      WHERE id = $1
      `,
            [taskId]
        );

        if (taskRes.rows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        const task = taskRes.rows[0];

        // Check access to the project
        const access = await getProjectAccess(pool, task.project_id, userId);
        if (!access.exists) return res.status(404).json({ message: "Project not found" });
        if (!access.hasAccess) return res.status(403).json({ message: "You don’t have access to this project." });

        return res.json(task);
    } catch (error) {
        console.error("Failed getting task by Id!", error.message);
        return res.status(500).json({ message: "Failed fetching Task by ID" });
    }
}
//create task
// POST /api/tasks
// Body: { project_id, title, description?, status?, priority?, created_by, assigned_to?, due_date? }
export async function createTask(req, res) {
    try {
        const {
            project_id,
            title,
            description,
            status = "backlog",
            priority = "medium",
            assigned_to,
            due_date,
        } = req.body;

        if (!project_id || !title) {
            return res.status(400).json({ message: "project_id and title are required!" });
        }

        const projectId = Number(project_id);
        if (Number.isNaN(projectId)) {
            return res.status(400).json({ message: "Invalid project_id" });
        }

        const userId = req.user.id;

        // ✅ permission check (owner OR member)
        const access = await getProjectAccess(pool, projectId, userId);

        if (!access.exists) {
            return res.status(404).json({ message: "Project not found" });
        }
        if (!access.hasAccess) {
            return res.status(403).json({ message: "You don’t have access to this project." });
        }
        if (!canWrite(access.my_role)) {
            return res.status(403).json({ message: "You have read-only access. Editors only can add tasks." });
        }

        const assignedTo = assigned_to ? Number(assigned_to) : null;
        if (assigned_to && Number.isNaN(assignedTo)) {
            return res.status(400).json({ message: "Invalid assigned_to" });
        }

        const insertQuery = `
      INSERT INTO tasks (project_id, title, description, status, priority, created_by, assigned_to, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, project_id, title, description, status, priority,
                created_by, assigned_to, due_date, created_at, updated_at
    `;

        const result = await pool.query(insertQuery, [
            projectId,
            title,
            description || null,
            status,
            priority,
            userId,
            assignedTo,
            due_date || null,
        ]);

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error in createTask:", error.message);
        return res.status(500).json({ message: "Failed to create task." });
    }
}

// PATCH /api/tasks/:taskId
// Body: any of { title, description, status, priority, assigned_to, due_date }
export async function updateTask(req, res) {
    try {
        const { taskId } = req.params;
        const id = Number(taskId);

        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid task id" });
        }

        const { title, description, status, priority, assigned_to, due_date } = req.body;

        const assignedTo = assigned_to ? Number(assigned_to) : null;
        if (assigned_to && Number.isNaN(assignedTo)) {
            return res.status(400).json({ message: "Invalid assigned_to" });
        }

        // 1) Find task -> get its project_id
        const taskRes = await pool.query(
            `SELECT id, project_id FROM tasks WHERE id = $1`,
            [id]
        );

        if (taskRes.rows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        const projectId = taskRes.rows[0].project_id;
        const userId = req.user.id;

        // 2) Check access to the project (owner/member)
        const access = await getProjectAccess(pool, projectId, userId);

        if (!access.exists) {
            // project deleted or inconsistent data
            return res.status(404).json({ message: "Project not found" });
        }

        if (!access.hasAccess) {
            return res.status(403).json({ message: "You don’t have access to this project." });
        }

        if (!canWrite(access.my_role)) {
            return res.status(403).json({ message: "You have read-only access. Editors only can edit tasks." });
        }

        // 3) Update task
        const updateQuery = `
      UPDATE tasks
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        assigned_to = COALESCE($5, assigned_to),
        due_date = COALESCE($6, due_date),
        updated_at = NOW()
      WHERE id = $7
      RETURNING id, project_id, title, description, status, priority,
                created_by, assigned_to, due_date, created_at, updated_at
    `;

        const result = await pool.query(updateQuery, [
            title ?? null,
            description ?? null,
            status ?? null,
            priority ?? null,
            assignedTo,
            due_date ?? null,
            id,
        ]);

        return res.json(result.rows[0]);
    } catch (error) {
        console.error("Error in updateTask:", error.message);
        return res.status(500).json({ message: "Failed to update task" });
    }
}
// DELETE /api/tasks/:taskId
export async function deleteTask(req, res) {
    try {
        const { taskId } = req.params;
        const id = Number(taskId);

        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid task id" });
        }

        // 1) Find task -> get project_id
        const taskRes = await pool.query(
            `SELECT id, project_id FROM tasks WHERE id = $1`,
            [id]
        );

        if (taskRes.rows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        const projectId = taskRes.rows[0].project_id;
        const userId = req.user.id;

        // 2) Check access to the project
        const access = await getProjectAccess(pool, projectId, userId);

        if (!access.exists) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (!access.hasAccess) {
            return res.status(403).json({ message: "You don’t have access to this project." });
        }

        if (!canWrite(access.my_role)) {
            return res.status(403).json({ message: "You have read-only access. Editors only can delete tasks." });
        }

        // 3) Delete task
        const query = `
      DELETE FROM tasks
      WHERE id = $1
      RETURNING id, project_id, title, description, status, priority,
                created_by, assigned_to, due_date, created_at, updated_at
    `;

        const result = await pool.query(query, [id]);

        return res.json({ message: "Task deleted", task: result.rows[0] });
    } catch (error) {
        console.error("Error in deleteTask:", error.message);
        return res.status(500).json({ message: "Failed to delete task" });
    }
}


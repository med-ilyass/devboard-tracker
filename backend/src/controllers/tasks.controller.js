import pool from "../config/db.js";
//get all tasks
export async function getTasks(req, res) {
    // res.json({ message: "Get all task works!" })
    try {
        const { projectId } = req.query;
        let result;
        if (projectId) {
            const id = Number(projectId)
            if (Number.isNaN(id)) {
                return res.status(400).json({ message: "Invalid project id in query" })
            }
            result = await pool.query(`
                SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
                t.created_by, t.assigned_to, t.due_date, t.created_at, t.updated_at
                FROM tasks t
                JOIN projects p ON p.id = t.project_id
                WHERE t.project_id = $1 AND p.owner_id = $2
                ORDER BY t.created_at DESC;
                `, [id, req.user.id])
        } else {
            result = await pool.query(
                `
        SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
       t.created_by, t.assigned_to, t.due_date, t.created_at, t.updated_at
        FROM tasks t
        JOIN projects p ON p.id = t.project_id
       WHERE p.owner_id = $1
        ORDER BY t.created_at DESC;
        `, [req.user.id]
            );
        }
        res.json(result.rows)
    } catch (err) {
        console.error("Failed getting all Tasks", err.message);
        res.status(500).json({ err: "Failing fetshing tasks!" })
    }
}
//get tasks by id
export async function getTaskById(req, res) {
    // res.json({ message: "Get task by is works" })
    try {
        const { taskId } = req.params;
        const id = Number(taskId);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid task id" })
        }
        const results = await pool.query(`
            SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
       t.created_by, t.assigned_to, t.due_date, t.created_at, t.updated_at
       FROM tasks t
         JOIN projects p ON p.id = t.project_id
         WHERE t.id = $1 AND p.owner_id = $2;`, [id, req.user.id])

        if (results.rows.length === 0) {
            return res.status(404).json({ message: "Task not found" })
        }
        const task = results.rows[0]
        res.json(task)
    } catch (error) {
        console.error("Failed getting task by Id!", error.message)
        res.status(500).json({ error: "Failing fetshing Task by ID!" })
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
            due_date
        } = req.body;

        if (!project_id || !title) {
            return res.status(400).json({ message: "project_id and title are required!" });
        }

        const projectId = Number(project_id);
        if (Number.isNaN(projectId)) {
            return res.status(400).json({ message: "Invalid project_id" });
        }

        const createdBy = req.user.id;
        const assignedTo = assigned_to ? Number(assigned_to) : null;
        if (assigned_to && Number.isNaN(assignedTo)) {
            return res.status(400).json({ message: "Invalid assigned_to" });
        }

        const ownership = await pool.query(
            "SELECT id FROM projects WHERE id = $1 AND owner_id = $2",
            [projectId, req.user.id]
        );

        if (ownership.rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
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
            createdBy,
            assignedTo,
            due_date || null
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

        const updateQuery = `
      UPDATE tasks t
      SET
        title = COALESCE($1, t.title),
        description = COALESCE($2, t.description),
        status = COALESCE($3, t.status),
        priority = COALESCE($4, t.priority),
        assigned_to = COALESCE($5, t.assigned_to),
        due_date = COALESCE($6, t.due_date),
        updated_at = NOW()
      FROM projects p
      WHERE t.id = $7
        AND p.id = t.project_id
        AND p.owner_id = $8
      RETURNING t.id, t.project_id, t.title, t.description, t.status, t.priority,
                t.created_by, t.assigned_to, t.due_date, t.created_at, t.updated_at
    `;

        const result = await pool.query(updateQuery, [
            title ?? null,
            description ?? null,
            status ?? null,
            priority ?? null,
            assignedTo,
            due_date ?? null,
            id,
            req.user.id
        ]);

        if (result.rows.length === 0) {
            // not found OR not yours
            return res.status(404).json({ message: "Task not found" });
        }

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

    const query = `
      DELETE FROM tasks t
      USING projects p
      WHERE t.id = $1
        AND p.id = t.project_id
        AND p.owner_id = $2
      RETURNING t.id, t.project_id, t.title, t.description, t.status, t.priority,
                t.created_by, t.assigned_to, t.due_date, t.created_at, t.updated_at
    `;

    const result = await pool.query(query, [id, req.user.id]);

    if (result.rows.length === 0) {
      // not found OR not yours
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json({ message: "Task deleted", task: result.rows[0] });
  } catch (error) {
    console.error("Error in deleteTask:", error.message);
    return res.status(500).json({ message: "Failed to delete task" });
  }
}
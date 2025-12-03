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
                return res.status(404).json({ message: "Invalid project id in query" })
            }

            result = await pool.query(`
                SELECT id, project_id, title, description, status, priority,
               created_by, assigned_to, due_date, created_at, updated_at
               FROM tasks
               WHERE project_id = $1
               ORDER BY created_at DESC
                `, [id])
        } else {
            result = await pool.query(
                `
        SELECT id, project_id, title, description, status, priority,
               created_by, assigned_to, due_date, created_at, updated_at
        FROM tasks
        ORDER BY created_at DESC
        `
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
        const { taskId } = req.parms;
        const id = Number(taskId);

        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid task id" })
        }
        const results = await pool.query(`
            Select id, project_id, title, description, status, priority, created_by
            , assigned_to, due_dtae, created_at, updated_at
            FROM tasks
            Where id=$1`, [id])

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
    // res.json({ message: "Create task works" })
    try {
        const { project_id,
            title,
            description,
            status = "backlog",
            priority = "medium",
            created_by,
            assigned_to,
            due_date
        } = res.body;

        if (!project_id || !title || !created_by) {
            return res.status(400).json({ message: "project id, title, created by are required!" })
        }

        const projectId = Number(project_id);
        const createdBy = Number(created_by);
        const assignedTo = assigned_to ? Number(assigned_to) : null

        if (Number.isNaN(projectId) || Number.isNaN(createdBy) || (assigned_to && Number.isNaN(assignedTo))) {
            return res.status(400).json({ message: "Invalid numeric field(s)" })
        }

        const insertQuery = `INSERT INTO tasks (project_id, title, description, status, priority,
        created_by, assigned_to, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)  RETURNING id, project_id, title, description, status, priority,
                created_by, assigned_to, due_date, created_at, updated_at`;

        const result = await pool.query(insertQuery, [projectId,
            title,
            description || null,
            status,
            priority,
            createdBy,
            assignedTo,
            due_date || null]);

        const task = result.rows[0];
        res.status(201).json(task)


    } catch (error) {
        console.error("Error in create task!1", error)
        res.status(500).json({ error: "Failed to create task." })

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
      UPDATE tasks
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        assigned_to = COALESCE($5, assigned_to),
        due_date = COALESCE($6, due_date)
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
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        const task = result.rows[0];
        res.json(task);
    } catch (error) {
        console.error("Error in updateTask:", error.message);
        res.status(500).json({ message: "Failed to update task" });
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

        const result = await pool.query(
            `
      DELETE FROM tasks
      WHERE id = $1
      RETURNING id, project_id, title, description, status, priority,
                created_by, assigned_to, due_date, created_at, updated_at
      `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        const task = result.rows[0];
        res.json({ message: "Task deleted", task });
    } catch (error) {
        console.error("Error in deleteTask:", error.message);
        res.status(500).json({ message: "Failed to delete task" });
    }
}
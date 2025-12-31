import pool from "../config/db.js"
//get all projects 
export async function getProjects(req, res) {
    // res.json({ message: "get Projects works!" })
    // For now: returns all projects (later I can filter by req.user.id)
    //changing the getproject function to get only the project owned by me and where i am a member at 
    try {
        const ownerId = req.user.id;
        console.log("✅ getProjects handler hit");
        const result = await pool.query(
            `SELECT p.id, p.name, p.description, p.owner_id, p.status, p.created_at,
                CASE
                    WHEN p.owner_id = $1 THEN 'owner'
                    ELSE pm.role
                END AS my_role
            FROM projects p
            LEFT JOIN project_members pm
            ON pm.project_id = p.id AND pm.user_id = $1
            WHERE p.owner_id = $1 OR pm.user_id = $1
            ORDER BY p.created_at DESC;`,
            [ownerId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error in get all projects", error.message)
        res.status(500).json({ message: "Failed to fetsh projects" })
    }
}
//create a new project
// Body: { name, description, owner_id? }
export async function createProject(req, res) {
    // res.json({ messgae: "Create Projects works!" })
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: "name is required!" })
        }
        //Later i will use req.user.id instead of owner_id from body
        // const ownerId = owner_id ?? null;
        const ownerId = req.user.id;
        if (!ownerId) {
            return res.status(400).json({ message: "owner_id is required for now (until auth is implement)" })
        }
        const insertQuery = `insert into projects (name, description, owner_id)
        values ($1, $2, $3) RETURNING id, name, description, owner_id, status, created_at`;

        const results = await pool.query(insertQuery, [name, description || null, ownerId])
        const project = results.rows[0];

        res.status(201).json(project)

    } catch (error) {
        console.error(" Error in create project", error.message)
        res.status(500).json({ error: "Failed to create project" })
    }
}
//get a specific project
export async function getProjectById(req, res) {
    // res.json({ message: "Get projects by Id Works!" })
    try {
        const { projectId } = req.params;
        const id = Number(projectId);

        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid project id" })
        }
        const ownerId = req.user.id;

        const result = await pool.query(
            `SELECT id, name, description, owner_id, status, created_at 
            FROM projects
            WHERE id = $1 AND owner_id = $2`,
            [id, ownerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Project not found!" })
        }
        const project = result.rows[0]
        res.json(project)
    } catch (error) {
        console.error("Error in get project by id", error.message)
        res.status(500).json({ error: "Failed to get project by Id" })
    }

}
//Update project
export async function updateProject(req, res) {
    // res.json({ message: "update project works!!" })
    try {
        const { projectId } = req.params;
        const id = Number(projectId);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid project id" })
        }
        const { name, description, status } = req.body;
        // Use COALESCE so undefined fields are ignored
        const updateQuery = `update projects set name = COALESCE($1, name), description = COALESCE($2, description),
        status = COALESCE($3, status) where id = $4 AND owner_id = $5 RETURNING id, name, description, owner_id, status, created_at`;
        const result = await pool.query(updateQuery, [name ?? null, description ?? null, status ?? null, id, req.user.id])
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Project not found" })
        }
        const project = result.rows[0];
        res.json(project);
    } catch (error) {
        console.error("Error in updateProject:", error.message);
        res.status(500).json({ message: "Failed to update project" });
    }
}
//delete project
// For now: soft delete → set status = 'archived'
export async function deleteProject(req, res) {
    // res.json({ messgae: "Delete project works !!" })
    try {
        const { projectId } = req.params;
        const id = Number(projectId)

        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid project id" })
        }
        const deleteQuery = await pool.query(`
            UPDATE projects
            SET status = 'archived'
            WHERE id = $1 AND owner_id = $2
            RETURNING id, name, description, owner_id, status, created_at 
            `, [id, req.user.id])

        if (deleteQuery.rows.length === 0) {
            return res.status(404).json({ message: "Project not found" })
        }
        const project = deleteQuery.rows[0]
        res.json({ message: "Project archived", project })
    } catch (error) {
        console.error("Error in delete projects", error.message)
        res.status(500).json({ error: "Failed deletin project" })
    }
}
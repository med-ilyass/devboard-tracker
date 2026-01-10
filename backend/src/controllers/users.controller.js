import pool from "../config/db.js";

export async function searchUsers(req, res) {
    try {
        const q = String(req.query.query || "").trim().toLowerCase();

        //avoinding returning the whole db on emty input
        if (q.length < 2) return res.json([]);

        //return only minimal info (no sensitive data)
        //Use ILIKE to case-insensitive prefix match

        const { rows } = await pool.query(`select email from users where LOWER(email) LIKE $1 order by email`, [`${q}%`])
        return res.json(rows)
    } catch (error) {
        console.error("searchUsers error", error)
        res.status(500).json({ message: "Server Error" })
    }
}
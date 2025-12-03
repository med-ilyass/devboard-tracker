import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import pool from "../config/db.js"

const SALT_ROUND = 10;
function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role
    },
        process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXOIRES_IN || "7d"
    })
}
//POST api/auth/register
export async function register(req, res) {
    //res.json({ message: "regiter route works" })
    try {
        const { email, password, username, role } = req.body;
        if (!email || !password || !username) {
            return res.status(400).json({ message: "Eamil, password and name are required!" })
        }
        //let's check if user exists
        const existing = await pool.query(`select id from users where Email = $1`, [email])
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "Email already in use!" })
        }
        //let's hash the password
        const passwordHash = await bcrypt.hash(password, SALT_ROUND);
        const userRole = role || "devoloper"
        const insertQuery = `Insert into users (email, password_hash, name, role) values ($1, $2, $3, $4) RETURNING id, email, username, role, created_at`;
        const result = await pool.query(insertQuery, [email, passwordHash, username, userRole]);
        const user = result.rows[0];
        const token = generateToken(user);
        return res.status(201).json({
            user, token
        })
    } catch (error) {
        console.error("Error in register!", error.message)
        return res.status(500).json({ error: "Server error during registration!" })
    }
}
//POST api/auth/login
export function login(req, res) {
    res.json({ message: "login route works" })
}
//GET api/auth/me
export function getMe(req, res) {
    res.json({ message: "me route works" })
}



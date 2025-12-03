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
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    })
}
//POST api/auth/register
export async function register(req, res) {
    //res.json({ message: "regiter route works" })
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: "Email, password and name are required!" })
        }
        //let's check if user exists
        const existing = await pool.query(`select id from users where email = $1`, [email])
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "Email already in use!" })
        }
        //let's hash the password
        const passwordHash = await bcrypt.hash(password, SALT_ROUND);
        const userRole = role || "developer"
        const insertQuery = `Insert into users (email, password_hash, name, role) values ($1, $2, $3, $4) RETURNING id, email, name, role, created_at`;
        const result = await pool.query(insertQuery, [email, passwordHash, name, userRole]);
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
export async function login(req, res) {
    //res.json({ message: "login route works" })
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required!" })
        }
        const result = await pool.query(`select id, email, role, password_hash, name, created_at from users where email =$1`, [email])
        if (result.rows.length === 0) {
            return res
                .status(401)
                .json({ message: "Invalid credentials!" })
        }
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash)
        // I add multiple "!" just test and know when i am putting a valid email and when i am not
        if (!isMatch) {
            return res
                .status(401)
                .json({ message: "Invalid credentials!!!!" })
        }
        //deleting password_hash before sending user -_-
        delete user.password_hash;
        const token = generateToken(user)
        return res
            .status(200)
            .json({ user, token })
    } catch (error) {
        console.error("Error in Login", error.message)
        return res
            .status(500)
            .json({ message: "Server error durin Login." })
    }
}
//GET api/auth/me
export async function getMe(req, res) {
    // res.json({ message: "me route works" })
    try {
        const userId = req.user.id;
        const result = await pool.query(`select id, email, name, role, created_at from users where id=$1`, [userId])
        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ message: "User Not Found." })
        }
        const user = result.rows[0]
        return res.status(200)
            .json({ user })
    } catch (error) {
        console.error("Error in Login", error.message)
        return res
            .status(500)
            .json({ message: "Server error fetshing user." })
    }
}
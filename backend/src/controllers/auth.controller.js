import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import pool from "../config/db.js"
import { randomInt } from 'node:crypto'

const COOLDOWN_SECONDS = 60;
const OTP_EXPIRES_MINUTES = 10; //code expiry
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
        return res.status(500).json({ error: "Server error during registration!!" })
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

export async function forgotPassword(req, res) {

    try {

        const { email } = req.body
        if (!email) return res.status(400).json({ message: "Email is required." })

        const genericResponce = { message: "If the email exists, a code was sent." }

        //let finf only user's id
        const userResults = await pool.query(`select id from users where email = $1`, [email])
        if (userResults.rows.length === 0) {
            //email not found -> but still respond OK
            return res.status(200).json(genericResponce)
        }
        const userId = userResults.rows[0].id;

        //Cooldown Check (Latest unused reset)
        const latestReset = await pool.query(`
            select id, last_sent_at from password_resets where user_id = $1 and used_at is null
            ORDER BY created_at DESC
            LIMIT 1
            `, [userId]);

        if (latestReset.rows.length > 0) {
            const lastSentAt = new Date(latestReset.rows[0].last_sent_at).getTime();
            const secondsSince = (Date.now() - lastSentAt) / 1000;

            if (secondsSince < COOLDOWN_SECONDS) {
                return res.status(429).json({
                    message: `Please wait ${Math.ceil(COOLDOWN_SECONDS - secondsSince)}s before resending.`
                });
            }
        }

        // Generate 6-digit numeric code
        const code = String(randomInt(100000, 1000000)); // 100000..999999

        // Hash code (never store plaintext)
        const codeHash = await bcrypt.hash(code, 10);

        // Expiry time
        const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

        // Insert reset record
        await pool.query(
            `
      INSERT INTO password_resets (user_id, code_hash, expires_at, last_sent_at)
      VALUES ($1, $2, $3, NOW())
      `,
            [userId, codeHash, expiresAt]
        );

        // For dev only: log the code (later: send via email)
        console.log("🔐 PASSWORD RESET CODE for", email, ":", code);

        return res.status(200).json(genericResponce);
    } catch (error) {
        console.error("Error in forgotPassword:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
}
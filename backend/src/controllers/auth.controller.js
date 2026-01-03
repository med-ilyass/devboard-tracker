import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import pool from "../config/db.js"
import crypto from "node:crypto";
import { sendEmail } from "../config/email.js";

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
    console.log("🔥 forgotPassword hit", req.body);

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
        // Generate 8-digit numeric code
        function generateResetCode(length = 8) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            const bytes = crypto.randomBytes(length);
            let code = "";
            for (let i = 0; i < length; i++) {
                code += chars[bytes[i] % chars.length];
            }
            return code;
        }
        // Hash code (never store plaintext)
        const code = generateResetCode(8)
        const codeHash = await bcrypt.hash(code, SALT_ROUND);
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
        await sendEmail({
            to: email,
            subject: "Devboard password reset code",
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <h2>Password reset</h2>
                <p>Use this code to reset your password:</p>
                <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; padding: 12px 0;">
                ${code}
                </div>
                <p>This code expires in ${OTP_EXPIRES_MINUTES} minutes.</p>
                <p>If you didn’t request this, you can ignore this email.</p>
            </div>
  `,
        });
        return res.status(200).json(genericResponce);
    } catch (error) {
        console.error("Error in forgotPassword:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
}
const MAX_ATTEMPTS = 5;
function generateResetToken(userId) {
    return jwt.sign(
        {
            id: userId, purpose: "pw_reset"
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "10m"
        }
    )
}
export async function verifyResetCode(req, res) {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ message: "Email and code are required" })
        }
        // first, find user
        const userResults = await pool.query(`select id from users where email=$1`, [email]);
        if (userResults.rows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired code." });
        }
        const userId = userResults.rows[0].id;
        //Second let get latest active reset row
        const resetResult = await pool.query(
            `
            select id, code_hash, expires_at, attempts
            from password_resets
            where user_id = $1 And used_at is null AND expires_at > NOW()
            order by created_at DESC
            LIMIT 1
            `, [userId]
        )
        if (resetResult.rows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired code." })
        }
        const resetRow = resetResult.rows[0];
        //Block if too many request
        if (resetRow.attempts >= MAX_ATTEMPTS) {
            return res.status(429).json({ message: "Too many attemps. Request a new code." })
        }
        //Compare OTP
        const ok = await bcrypt.compare(String(code), resetRow.code_hash);
        if (!ok) {
            //increment attempt
            await pool.query(`UPDATE password_resets SET attempts = attempts + 1 WHERE id = $1`, [resetRow.id]);
            return res.status(400).json({ message: "Invalid or expired code." })
        }
        //success -> issue resetToken
        const resetToken = generateResetToken(userId)
        return res.status(200).json({ resetToken })
    } catch (error) {
        console.error("Error in verifyResetCode:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
}
export async function resetPassword(req, res) {
    try {
        const { resetToken, newPassword } = req.body
        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: "resetToken and newPassword are required." })
        }
        //basic password rule (matching the froont-end )
        if (newPassword.length < 12) {
            return res.status(400).json({ message: "Password must be at least 12 characters." })
        }
        //verify token
        let payload;
        try {
            payload = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired reset token." })
        }
        // 2) check purpose
        if (payload.purpose !== "pw_reset" || !payload.id) {
            return res.status(401).json({ message: "Invalid reset token." });
        }
        const userId = payload.id;
        // 3) hash new password
        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUND);
        // 4) update user password
        await pool.query(
            "UPDATE users SET password_hash = $1 WHERE id = $2",
            [passwordHash, userId]
        );
        // 5) mark all active reset requests as used
        await pool.query(
            "UPDATE password_resets SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL",
            [userId]
        );
        return res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error in resetPassword:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
}
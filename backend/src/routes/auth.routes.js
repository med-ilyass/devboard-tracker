const express = require("express")
const router = express.Router()


//importt controller functions

const { regiter, login, getMe } = require("../controllers/auth.controller")

//POST /api/auth/register
router.post("/register", regiter)

//POST /api/auth/login
router.post("/login", login)

//GET /api/auth/me
router.get("/me", getMe)

module.exports = router;

//POST api/auth/register
export default function register(req, res) {
    res.json({ message: "regiter route works" })
}

//POST api/auth/login
export default function login(req, res) {
    res.json({ message: "login route works" })
}

//GET api/auth/me
export default function getMe(req, res) {
    res.json({ message: "me route works" })
}



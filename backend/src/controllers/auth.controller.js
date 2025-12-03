//POST api/auth/register
export function register(req, res) {
    res.json({ message: "regiter route works" })
}

//POST api/auth/login
export function login(req, res) {
    res.json({ message: "login route works" })
}

//GET api/auth/me
export function getMe(req, res) {
    res.json({ message: "me route works" })
}



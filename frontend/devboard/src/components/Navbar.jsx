import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <header className="navbar">
            <div className="navbar-left">
                <span className="logo">Devboard</span>
            </div>
            <div className="navbar-right">
                <Link to='/'>Projects</Link>
                <Link to='/login'>Login</Link>
                <Link to='/register'>Register</Link>
            </div>
        </header>
    )
}
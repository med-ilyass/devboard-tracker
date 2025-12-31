import { Link } from "react-router-dom"


export default function Home() {
    const token = localStorage.getItem("devboard_token")
    return (
        <div className="home">
            <h1 className="home-title">Devboard</h1>
            <p className="home-subtitle">
                A simple project + task tracker to orgonize you work and stay consistent.
            </p>

            <div className="home-actions">
                {token ? (
                    <Link className="btn primary" to="/projects">
                        Go to Projects
                    </Link>
                ) : (
                    <>
                        <Link className="btn primary" to="/login">
                            Login
                        </Link>
                        <Link className="btn secondary" to="/register">
                            Create account
                        </Link>
                    </>
                )
                }
            </div >
            <div className="home-features">
                <div className="feature">
                    <h3>Projects</h3>
                    <p>Create Projects and keep everything grouped.</p>
                </div>
                <div className="feature">
                    <h3>Tasks</h3>
                    <p>Add tasks with status and priority.</p>
                </div>
                <div className="feature">
                    <h3>Secure</h3>
                    <p>Protected routes with JWT authentication.</p>
                </div>

            </div>

        </div >
    )
}
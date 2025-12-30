import { Navigate, Outlet } from "react-router-dom";

export default function RequiredAuth() {
    const token = localStorage.getItem("devboard_token")
    if (!token) return <Navigate to="/login" replace />
    return <Outlet />
}
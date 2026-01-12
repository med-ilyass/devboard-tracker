
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function apiRequest(path, { method = "GET", body, token } = {}) {
    const headers = {};
    if (body) {
        headers["Content-Type"] = "application/json"
    }
    if (token) {
        headers["Authorization"] = `Bearer ${token}`
    }
    const url = path.startsWith("http") ? path : `${API_URL}${path}`;

    let res;
    try {
        res = await fetch(path, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        })
    } catch (error) {
        console.error("Network error:", error)
        throw new Error("Network error. Please try again.")
    }

    let data = null;
    try {
        data = await res.json();
    } catch (error) {
        // response has no body
    }
    if (!res.ok) {
        throw new Error(data?.message || "Request failed")
    }

    return data;
}
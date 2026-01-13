export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const base = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // if path is "/api/auth/register" -> "https://.../api/auth/register"
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    console.error("Network error:", error);
    throw new Error("Network error. Please try again.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}
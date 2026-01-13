const BASE_URL = import.meta.env.VITE_API_URL || "";

export async function searchUsersByEmail(token, query) {
    const res = await fetch(
        `${BASE_URL}/api/users/search?query=${encodeURIComponent(query)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    const data = await res.json().catch(() => []);
    if (!res.ok) throw new Error(data?.message || "Failed to search users");
    return data;
}
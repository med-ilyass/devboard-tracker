

export async function searchUsersByEmail(token, query) {
    const res = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json().catch(() => [])
    if (!res.ok) throw new Error(data?.message || "Failed to search users");
    return data;
}
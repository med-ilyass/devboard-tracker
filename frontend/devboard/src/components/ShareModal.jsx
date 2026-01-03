import { useEffect, useState } from "react"
import { addMembers, listMembers, removeMember } from "../api/projectMembers";

export default function ShareModal({ open, onClose, token, projectId }) {
    const [loading, setloading] = useState(false);
    const [error, setError] = useState("");
    const [members, setMembers] = useState([]);

    const [email, setEmail] = useState("");
    const [role, setRole] = useState("viewer");
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (!open) return;

        async function load() {
            setError("");
            setloading(true);
            try {
                const data = await listMembers(token, projectId)
                setMembers(data)
            } catch (error) {
                setError(error.message);
            } finally {
                setloading(false)
            }
        }
        load();
    }, [open, token, projectId])

    async function handleAdd(e) {
        e.preventDefault();
        setError("");
        setAdding(true)
        try {
            const res = await addMembers(token, projectId, { email, role })
            const added = res.member;

            setMembers((prev) => {
                const exists = prev.some((m) => m.user_id === added.user_id);
                if (exists) {
                    return prev.map((m) => (m.user_id === added.user_id ? { ...m, role: added.role } : m))
                }
                return [added, ...prev]
            })
            setEmail("");
            setRole("viewer")
        } catch (error) {
            setError(error.message)
        } finally {
            setAdding(false)
        }
    }
    async function handleRemove(userId) {
        setError("")
        try {
            await removeMember(token, projectId, userId);
            setMembers((prev) => prev.filter((m) => m.user_id != userId))
        } catch (e) {
            setError(e.message)
        }
    }
    if (!open) return null;
    return (
        <div style={styles.backdrop} onMouseDown={onClose}>
            <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h3 style={{ margin: 0 }}>Share project</h3>
                    <button type="button" onClick={onClose} style={styles.closeBtn}>
                        x
                    </button>
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <form onSubmit={handleAdd} style={styles.form}>
                    <input
                        type="email"
                        placeholder="Invite user by email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.select}>
                        <option value="viewer">viewer</option>
                        <option value="editor">editor</option>
                    </select>
                    <button type="submit" disabled={adding} style={styles.primaryBtn}>
                        {adding ? "Adding ..." : "Add"}
                    </button>
                </form>
                <hr />
                {loading ?
                    (<p>Loading members...</p>) :
                    (members.length === 0 ? (<p>No members yet.</p>) : (
                        <ul style={styles.list}>
                            {members.map((m) => (
                                <li key={m.user_id} style={styles.listItem}>
                                    <div>
                                        <strong>{m.name || "No name"}</strong>
                                        <div style={{ fontSize: 13, opacity: 0.8 }}>{m.email}</div>
                                    </div>
                                    <div style={styles.right}>
                                        <span style={styles.badge}>{m.role}</span>
                                        <button type="button" onClick={() => handleRemove(m.user_id)} style={styles.dangerBtn}>
                                            Remove
                                        </button>
                                    </div>
                                </li>
                            ))
                            }
                        </ul>
                    ))
                }
            </div>
        </div>
    )
}
const styles = {
    backdrop: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        zIndex: 999,
    },
    modal: {
        width: "min(720px, 100%)",
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        color: "#111", // 👈 THIS FIXES EVERYTHING INSIDE
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
    },
    closeBtn: {
        border: "none",
        background: "transparent",
        fontSize: 18,
        cursor: "pointer",
    },
    form: {
        display: "flex",
        gap: 8,
        marginBottom: 12,
        flexWrap: "wrap",
    },
    input: { flex: "1 1 240px", padding: 10, borderRadius: 8, border: "1px solid #ddd" },
    select: { padding: 10, borderRadius: 8, border: "1px solid #ddd" },
    primaryBtn: { padding: "10px 14px", borderRadius: 8, border: "1px solid #222", background: "#222", color: "#fff" },
    dangerBtn: { padding: "8px 10px", borderRadius: 8, border: "1px solid #c00", background: "#fff", color: "#c00" },
    list: { listStyle: "none", padding: 0, margin: 0 },
    listItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid #eee",
        gap: 12,
    },
    right: { display: "flex", alignItems: "center", gap: 10 },
    badge: { padding: "4px 8px", borderRadius: 999, background: "#f2f2f2", fontSize: 12 },
};
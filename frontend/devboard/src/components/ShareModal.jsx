import { useEffect, useRef, useState } from "react";
import { addMembers, listMembers, removeMember } from "../api/projectMembers";
import { searchUsersByEmail } from "../api/users.js";

export default function ShareModal({ open, onClose, token, projectId }) {
    const [loading, setloading] = useState(false);
    const [error, setError] = useState("");
    const [members, setMembers] = useState([]);

    const [email, setEmail] = useState("");
    const [role, setRole] = useState("viewer");
    const [adding, setAdding] = useState(false);

    // ✅ Autocomplete state
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSug, setLoadingSug] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [showSug, setShowSug] = useState(false);

    const debouncedEmail = useDebouncedValue(email, 250);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        async function load() {
            setError("");
            setloading(true);
            try {
                const data = await listMembers(token, projectId);
                setMembers(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setloading(false);
            }
        }
        load();
    }, [open, token, projectId]);

    // ✅ Autocomplete fetch
    useEffect(() => {
        if (!open) return;

        const q = debouncedEmail.trim().toLowerCase();

        // only search after 2 chars
        if (q.length < 2) {
            setSuggestions([]);
            setActiveIndex(-1);
            return;
        }

        let cancelled = false;

        async function run() {
            setLoadingSug(true);
            try {
                const data = await searchUsersByEmail(token, q);

                if (cancelled) return;

                // remove users already members + remove exact match
                const memberEmails = new Set(members.map((m) => String(m.email || "").toLowerCase()));
                const filtered = (data || [])
                    .filter((u) => u?.email)
                    .filter((u) => !memberEmails.has(String(u.email).toLowerCase()))
                    .filter((u) => String(u.email).toLowerCase() !== q)
                    .slice(0, 8);

                setSuggestions(filtered);
                setActiveIndex(filtered.length ? 0 : -1);
            } catch {
                if (!cancelled) setSuggestions([]);
            } finally {
                if (!cancelled) setLoadingSug(false);
            }
        }

        run();
        return () => {
            cancelled = true;
        };
    }, [debouncedEmail, open, token, members]);

    async function handleAdd(e) {
        e.preventDefault();
        setError("");
        setAdding(true);
        try {
            const res = await addMembers(token, projectId, { email, role });
            const added = res.member;

            setMembers((prev) => {
                const exists = prev.some((m) => m.user_id === added.user_id);
                if (exists) {
                    return prev.map((m) =>
                        m.user_id === added.user_id ? { ...m, role: added.role } : m
                    );
                }
                return [added, ...prev];
            });

            setEmail("");
            setRole("viewer");
            setSuggestions([]);
            setShowSug(false);
            setActiveIndex(-1);
        } catch (error) {
            setError(error.message);
        } finally {
            setAdding(false);
        }
    }

    async function handleRemove(userId) {
        setError("");
        try {
            await removeMember(token, projectId, userId);
            setMembers((prev) => prev.filter((m) => m.user_id != userId));
        } catch (e) {
            setError(e.message);
        }
    }

    function pickSuggestion(u) {
        setEmail(u.email);
        setSuggestions([]);
        setShowSug(false);
        setActiveIndex(-1);

        // keep focus on input
        requestAnimationFrame(() => inputRef.current?.focus());
    }

    function handleEmailKeyDown(e) {
        if (!showSug) return;
        if (!suggestions.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            // when suggestions open: Enter selects suggestion (instead of submitting)
            if (activeIndex >= 0) {
                e.preventDefault();
                pickSuggestion(suggestions[activeIndex]);
            }
        } else if (e.key === "Escape") {
            setShowSug(false);
            setSuggestions([]);
            setActiveIndex(-1);
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
                    {/* ✅ input wrapper for dropdown positioning */}
                    <div style={styles.autoWrap}>
                        <input
                            ref={inputRef}
                            type="email"
                            placeholder="Invite user by email"
                            value={email}
                            onChange={(e) => {
                                const val = e.target.value;
                                setEmail(val);
                                setShowSug(val.trim().length >= 2);
                            }}
                            onFocus={() => setShowSug(email.trim().length >= 2)}
                            onBlur={() => {
                                // delay so click can register
                                setTimeout(() => setShowSug(false), 120);
                            }}
                            onKeyDown={handleEmailKeyDown}
                            required
                            style={styles.input}
                            autoComplete="off"
                        />

                        {(showSug && (loadingSug || suggestions.length > 0)) && (
                            <div style={styles.dropdown}>
                                {loadingSug && (
                                    <div style={styles.dropItemMuted}>Searching…</div>
                                )}

                                {!loadingSug &&
                                    suggestions.map((u, idx) => (
                                        <button
                                            key={u.id}
                                            type="button"
                                            style={{
                                                ...styles.dropItem,
                                                ...(idx === activeIndex ? styles.dropItemActive : {}),
                                            }}
                                            onMouseDown={(e) => e.preventDefault()} // prevents blur
                                            onClick={() => pickSuggestion(u)}
                                        >
                                            <div style={styles.dropEmail}>{u.email}</div>
                                            {u.name && <div style={styles.dropName}>{u.name}</div>}
                                        </button>
                                    ))}
                            </div>
                        )}
                        {showSug && (loadingSug || suggestions.length > 0) && (
                            <div style={styles.kbdHint}>
                                <span style={styles.kbdKey}>↑</span>
                                <span style={styles.kbdKey}>↓</span>
                                <span style={styles.kbdText}>navigate</span>
                                <span style={styles.kbdDot}>•</span>
                                <span style={styles.kbdKey}>Enter</span>
                                <span style={styles.kbdText}>select</span>
                                <span style={styles.kbdDot}>•</span>
                                <span style={styles.kbdKey}>Esc</span>
                                <span style={styles.kbdText}>close</span>
                            </div>
                        )}
                    </div>

                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={styles.select}
                    >
                        <option value="viewer">viewer</option>
                        <option value="editor">editor</option>
                    </select>

                    <button type="submit" disabled={adding} style={styles.primaryBtn}>
                        {adding ? "Adding ..." : "Add"}
                    </button>
                </form>

                <hr />

                {loading ? (
                    <p>Loading members...</p>
                ) : members.length === 0 ? (
                    <p>No members yet.</p>
                ) : (
                    <ul style={styles.list}>
                        {members.map((m) => (
                            <li key={m.user_id} style={styles.listItem}>
                                <div>
                                    <strong>{m.name || "No name"}</strong>
                                    <div style={{ fontSize: 13, opacity: 0.8 }}>{m.email}</div>
                                </div>
                                <div style={styles.right}>
                                    <span
                                        style={{
                                            ...styles.badgeBase,
                                            ...(m.role === "owner"
                                                ? styles.badgeOwner
                                                : m.role === "editor"
                                                    ? styles.badgeEditor
                                                    : styles.badgeViewer),
                                        }}
                                    >
                                        {m.role}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(m.user_id)}
                                        style={styles.dangerBtn}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

function useDebouncedValue(value, delayMs) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(id);
    }, [value, delayMs]);
    return debounced;
}

const styles = {
    kbdHint: {
        marginTop: 6,
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexWrap: "wrap",
        fontSize: 12,
        color: "#444",
    },
    kbdKey: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2px 7px",
        borderRadius: 8,
        border: "1px solid #d5d5d5",
        background: "#fafafa",
        fontWeight: 700,
        color: "#111",
    },
    kbdText: { color: "#444" },
    kbdDot: { color: "#888" },
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
        borderRadius: 14,
        padding: 18,
        color: "#000",
        boxShadow: "0 22px 70px rgba(0,0,0,0.25)",
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
        alignItems: "flex-start",
    },

    // ✅ autocomplete styles
    autoWrap: { position: "relative", flex: "1 1 240px" },
    dropdown: {
        position: "absolute",
        top: "calc(100% + 6px)",
        left: 0,
        right: 0,
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 18px 50px rgba(0,0,0,0.16)",
        zIndex: 5,
    },

    dropItem: {
        width: "100%",
        textAlign: "left",
        border: "none",
        background: "transparent",
        padding: "10px 12px",
        cursor: "pointer",
        color: "#000",
    },

    dropItemActive: {
        background: "#f3f4f6",
    },

    dropItemMuted: {
        padding: "10px 10px",
        fontSize: 13,
        color: "#555",
    },

    dropEmail: {
        fontWeight: 700,
        fontSize: 13,
        color: "#000",
    },

    dropName: {
        fontSize: 12,
        color: "#444",
        marginTop: 2,
    },

    input: {
        width: "100%",
        padding: 10,
        borderRadius: 8,
        border: "1px solid #ddd",
        color: "#000",
        background: "#fff",
    },
    select: {
        padding: 10,
        borderRadius: 8,
        border: "1px solid #ddd",
        color: "#000",
        background: "#fff",
    },
    primaryBtn: {
        padding: "10px 14px",
        borderRadius: 8,
        border: "1px solid #000",
        background: "#000",
        color: "#fff",
        cursor: "pointer",
    },
    dangerBtn: {
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid #c00",
        background: "#fff",
        color: "#c00",
    },
    list: { listStyle: "none", padding: 0, margin: 0, },
    listItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 14px",
        borderRadius: 10,
        background: "#f7f7f7",          // ✅ soft background
        border: "1px solid #e5e5e5",
        marginBottom: 8,
        gap: 12,
        color: "#000",
    },
    listItemHover: {
        background: "#f0f0f0",
    },
    right: { display: "flex", alignItems: "center", gap: 10 },
    badge: { padding: "4px 8px", borderRadius: 999, background: "#eaeaea", fontSize: 12 },
    badgeBase: {
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        textTransform: "capitalize",
    },

    badgeOwner: {
        background: "rgba(124, 58, 237, 0.15)",
        color: "#5b21b6",
        border: "1px solid rgba(124, 58, 237, 0.35)",
    },

    badgeEditor: {
        background: "rgba(37, 99, 235, 0.15)",
        color: "#1e40af",
        border: "1px solid rgba(37, 99, 235, 0.35)",
    },

    badgeViewer: {
        background: "#e5e5e5",
        color: "#333",
        border: "1px solid #ccc",
    },
};
import { useEffect, useState } from "react"
import { addMembers, listMembers, removeMember } from "../api/projectMembers";

export default function ShareModal({ open, onClose, token, projectId }) {
    const [loading, setloading] = useState(false);
    const [error, setError] = useState(false);
    const [members, setMembers] = useState([]);

    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
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
                setEmail(error.message)
            } finally {
                setloading(true)
            }
        }
    }, [open, token, projectId])


    return (
        <>
        </>
    )
}
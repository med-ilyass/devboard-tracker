import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";

export default function ResetPassword() {

    const [searchParams] = useSearchParams();
    const email = useMemo(() => searchParams.get("email") || "", [searchParams]);

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    //Cooldown timer state
    const COOLDOWN_SECONDS = 60;
    //key per email so different email don't share cooldown
    const storageKey = email ? `devboard_resend_available_at:${email}` : null;
    function computeSecondsLeft(availableAtMs) {
        const diffMs = availableAtMs - Date.now();
        return Math.max(0, Math.ceil(diffMs / 1000))
    }
    const [secondLeft, setSecondLeft] = useState(0);
    const canResend = secondLeft === 0;

    useEffect(() => {
        if (!storageKey) return;
        const raw = localStorage.getItem(storageKey);
        //start emmedialtely if no saved cooldown

        if (!raw) {
            const availableAt = Date.now() + COOLDOWN_SECONDS * 1000;
            localStorage.setItem(storageKey, String(availableAt))
            setSecondLeft(computeSecondsLeft(availableAt))
            // setSecondLeft(0)
            return;
        }
        const availableAt = Number(raw)

        if (Number.isNaN(availableAt)) {
            localStorage.removeItem(storageKey);
            setSecondLeft(0)
            return;
        }
        setSecondLeft(computeSecondsLeft(availableAt))
    }
        , [storageKey])
    useEffect(() => {
        if (!storageKey) return;
        if (secondLeft === 0) {
            return;
        }
        const id = setInterval(() => {
            const raw = localStorage.getItem(storageKey);
            const availableAt = Number(raw);
            if (Number.isNaN(availableAt)) {
                setSecondLeft(0)
                return;
            }
            // setSecondLeft((s) => Math.max(0, s - 1));
            setSecondLeft(computeSecondsLeft(availableAt))
        }, 1000)
        return () => clearInterval(id)
    }, [secondLeft, storageKey])

    async function handleResend() {
        if (!email) {
            setError("Missing email. Go Back and request a reset again.")
            return;
        }
        setError("");
        try {
            //later i will xonnect this to the backend
            //await fetch("somethink like /api/auth/forget-password", {....})

            //for now just simulate success::
            console.log("Resend Code to: ", email)
            const availableAt = Date.now() + COOLDOWN_SECONDS * 1000;
            localStorage.setItem(storageKey, String(availableAt));
            setSecondLeft(computeSecondsLeft(availableAt))
        } catch (error) {
            console.error(error)
            setError("Failed to resend code. try again.")
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("")
        setLoading(true);

        const form = new FormData(e.target);
        const code = form.get("code")
        const newPassword = form.get("new_password")
        const confirmPassword = form.get("confirm_password")

        if (newPassword.trim() !== confirmPassword.trim()) {
            setError("Password do not match!")
            setLoading(false)
            return;
        }

        // For now: we’ll connect verify + reset to backend next
        console.log({ email, code, newPassword })
        setLoading(false)

    }

    return (
        <div className="page">
            <h1>Reset Password</h1>
            {email && <p>Resetting password for: <strong>{email}</strong></p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                    <label>Code</label>
                    <input type="text" name="code" required />
                </div>
                <div className="field">
                    <label>New Password</label>
                    <input type="password" name="new_password" minLength={12} maxLength={20} required />
                </div>
                <div className="field">
                    <label>Confirm Password</label>
                    <input type="password" name="confirm_password" required />
                </div>
                <button type="submit" disabled={loading}>
                    {
                        loading ? "Updating..." : "Update Password"
                    }
                </button>
                <div style={{ marginTop: "1rem" }}>
                    <button type="button" onClick={handleResend} disabled={!canResend}>
                        Resend code
                    </button>
                    {!canResend && (
                        <p style={{ marginTop: "0.5rem" }}>Resend available in <strong>{secondLeft}</strong>s</p>
                    )}
                </div>
                <p style={{ marginTop: "1rem" }}>Back to <Link to="/login">Login</Link></p>
            </form>
        </div>
    );
}
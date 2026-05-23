import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";

export default function Register({ onSwitch }: { onSwitch: () => void }) {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const valid = name && email && password && confirm && password === confirm && password.length >= 6;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 16px" }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 36, height: 36, borderRadius: 9, background: "#3b5bdb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#fff", fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.025em" }}>ForgeCRM</span>
          </div>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Create your free workspace</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "32px 28px", boxShadow: "0 4px 24px rgba(15,23,42,0.06)" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", margin: "0 0 22px", letterSpacing: "-0.02em" }}>Create your account</h1>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "10px 12px", marginBottom: 16, fontSize: 13, color: "#dc2626", display: "flex", alignItems: "center", gap: 7 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Full Name", value: name, onChange: setName, type: "text", placeholder: "Alex Sterling" },
              { label: "Email Address", value: email, onChange: setEmail, type: "email", placeholder: "you@company.com" },
              { label: "Password", value: password, onChange: setPassword, type: "password", placeholder: "Min. 6 characters" },
              { label: "Confirm Password", value: confirm, onChange: setConfirm, type: "password", placeholder: "Repeat password" },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 5, letterSpacing: "0.02em" }}>{f.label}</label>
                <input
                  type={f.type} value={f.value} onChange={e => f.onChange(e.target.value)}
                  placeholder={f.placeholder} required autoComplete="off"
                  style={{ width: "100%", height: 38, padding: "0 11px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 13.5, color: "#0f172a", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#5c7cfa"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(92,124,250,0.1)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                />
                {f.label === "Confirm Password" && confirm && password !== confirm && (
                  <p style={{ fontSize: 11, color: "#ef4444", margin: "3px 0 0" }}>Passwords don't match</p>
                )}
              </div>
            ))}

            <button
              type="submit" disabled={loading || !valid}
              style={{
                width: "100%", height: 40, borderRadius: 5, border: "none",
                background: loading || !valid ? "#94a3b8" : "#3b5bdb",
                color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: loading || !valid ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "background 0.15s", marginTop: 4,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              }}
              onMouseEnter={e => { if (!loading && valid) (e.currentTarget as HTMLButtonElement).style.background = "#2f4ac9"; }}
              onMouseLeave={e => { if (!loading && valid) (e.currentTarget as HTMLButtonElement).style.background = "#3b5bdb"; }}
            >
              {loading && <span className="material-symbols-outlined" style={{ fontSize: 16, animation: "spin 1s linear infinite" }}>progress_activity</span>}
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#64748b", margin: "20px 0 0" }}>
            Already have an account?{" "}
            <button onClick={onSwitch} style={{ background: "none", border: "none", color: "#3b5bdb", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: 0 }}>
              Sign in
            </button>
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: 11.5, color: "#94a3b8", marginTop: 20 }}>
          Your data is private and never shared
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

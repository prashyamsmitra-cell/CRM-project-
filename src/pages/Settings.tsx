import { useState } from "react";
import Layout from "../components/Layout";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "22px 24px", marginBottom: 16 }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 16px", paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, type = "text", value, onChange, hint, readOnly }: {
  label: string; type?: string; value: string; onChange?: (v: string) => void;
  hint?: string; readOnly?: boolean;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 5, letterSpacing: "0.02em" }}>{label}</label>
      <input type={type} value={value} readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        style={{
          width: "100%", height: 34, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 4,
          fontSize: 13, color: readOnly ? "#94a3b8" : "#0f172a", background: readOnly ? "#f8fafc" : "#fff",
          outline: "none", fontFamily: "inherit", boxSizing: "border-box", cursor: readOnly ? "not-allowed" : "text",
        }}
        onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = "#5c7cfa"; }}
        onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
      />
      {hint && <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>{hint}</p>}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #f8fafc" }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#1e293b", margin: "0 0 2px" }}>{label}</p>
        <p style={{ fontSize: 11.5, color: "#94a3b8", margin: 0 }}>{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
          background: checked ? "#3b5bdb" : "#e2e8f0", transition: "background 0.2s",
          position: "relative", flexShrink: 0, marginTop: 2,
        }}
      >
        <span style={{
          position: "absolute", top: 3, left: checked ? 21 : 3, width: 16, height: 16,
          borderRadius: "50%", background: "#fff", transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }} />
      </button>
    </div>
  );
}

export default function Settings() {
  const [profile, setProfile] = useState({ name: "Alex Sterling", email: "alex@forgecrm.io", role: "Senior BDA", phone: "+1 (555) 100-0001", timezone: "America/New_York" });
  const [notifs, setNotifs] = useState({ newLead: true, dealUpdate: true, taskDue: false, teamActivity: false, weeklyReport: true });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Layout title="Settings">
      <div style={{ padding: "20px 32px 40px", maxWidth: 680 }}>
        <Section title="Profile Information">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Field label="Full Name" value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} />
            <Field label="Email Address" type="email" value={profile.email} onChange={v => setProfile(p => ({ ...p, email: v }))} />
            <Field label="Role / Title" value={profile.role} onChange={v => setProfile(p => ({ ...p, role: v }))} />
            <Field label="Phone" type="tel" value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} />
            <Field label="Timezone" value={profile.timezone} onChange={v => setProfile(p => ({ ...p, timezone: v }))} />
            <Field label="Plan" value="Enterprise Plan" readOnly hint="Contact support to change your plan." />
          </div>
        </Section>

        <Section title="Notifications">
          <Toggle label="New Lead Assigned" description="Notify when a new lead is assigned to you." checked={notifs.newLead} onChange={v => setNotifs(p => ({ ...p, newLead: v }))} />
          <Toggle label="Deal Stage Updates" description="Notify when a deal you own changes stage." checked={notifs.dealUpdate} onChange={v => setNotifs(p => ({ ...p, dealUpdate: v }))} />
          <Toggle label="Task Due Reminders" description="Remind 24 hours before a task is due." checked={notifs.taskDue} onChange={v => setNotifs(p => ({ ...p, taskDue: v }))} />
          <Toggle label="Team Activity Feed" description="Receive updates on team activity." checked={notifs.teamActivity} onChange={v => setNotifs(p => ({ ...p, teamActivity: v }))} />
          <Toggle label="Weekly Pipeline Report" description="Receive a summary report every Monday." checked={notifs.weeklyReport} onChange={v => setNotifs(p => ({ ...p, weeklyReport: v }))} />
        </Section>

        <Section title="Security">
          <Field label="Current Password" type="password" value="••••••••" readOnly />
          <Field label="New Password" type="password" value="" hint="Minimum 8 characters." />
          <Field label="Confirm Password" type="password" value="" />
        </Section>

        <Section title="Data & Privacy">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Export CRM Data", icon: "download", color: "#3b5bdb", hint: "Download all leads, tasks, and activity as CSV." },
              { label: "Request Data Deletion", icon: "delete_forever", color: "#ef4444", hint: "Permanently remove your account and all associated data." },
            ].map(action => (
              <button key={action.label} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 6,
                border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", textAlign: "left",
                transition: "background 0.1s", fontFamily: "inherit",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#fff"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: action.color }}>{action.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#1e293b", margin: 0 }}>{action.label}</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{action.hint}</p>
                </div>
              </button>
            ))}
          </div>
        </Section>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={{ height: 34, padding: "0 16px", borderRadius: 4, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#475569" }}>
            Discard Changes
          </button>
          <button onClick={handleSave} style={{
            height: 34, padding: "0 16px", borderRadius: 4, border: "none",
            background: saved ? "#22c55e" : "#3b5bdb", color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", transition: "background 0.2s",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {saved && <span className="material-symbols-outlined" style={{ fontSize: 15 }}>check</span>}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </Layout>
  );
}

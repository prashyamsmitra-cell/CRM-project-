import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { icon: "dashboard", label: "Dashboard", path: "/" },
  { icon: "group", label: "Leads", path: "/leads" },
  { icon: "view_kanban", label: "Pipeline", path: "/pipeline" },
  { icon: "task_alt", label: "Tasks", path: "/tasks" },
  { icon: "bar_chart", label: "Analytics", path: "/analytics" },
  { icon: "people", label: "Team", path: "/team" },
  { icon: "settings", label: "Settings", path: "/settings" },
];

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}

export default function Layout({ children, title, actions }: LayoutProps) {
  const [location, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8fafc", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{
        width: 248, minWidth: 248, background: "#1c2840",
        display: "flex", flexDirection: "column", height: "100vh",
        position: "fixed", left: 0, top: 0, zIndex: 50,
      }}>
        {/* Brand */}
        <div style={{ padding: "20px 18px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 3 }}>
            <span style={{ width: 28, height: 28, borderRadius: 6, background: "#3b5bdb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#fff", fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#eef2ff", letterSpacing: "-0.02em" }}>ForgeCRM</span>
          </div>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500, paddingLeft: 37 }}>Enterprise Plan</span>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "0 0 6px" }} />

        {/* Nav */}
        <nav style={{ flex: 1, padding: "4px 8px", overflowY: "auto" }}>
          {NAV.map((item) => {
            const isActive = location === item.path || (item.path === "/" && location === "");
            return (
              <button key={item.path} onClick={() => navigate(item.path)} style={{
                display: "flex", alignItems: "center", gap: 9, width: "100%",
                padding: "8px 11px", borderRadius: 6, border: "none", cursor: "pointer",
                marginBottom: 1, background: isActive ? "rgba(59,91,219,0.18)" : "transparent",
                borderLeft: `2.5px solid ${isActive ? "#5c7cfa" : "transparent"}`,
                transition: "background 0.1s", fontFamily: "inherit",
              }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: isActive ? "#748ffc" : "#64748b", flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 13.5, fontWeight: isActive ? 600 : 400, color: isActive ? "#c5cfff" : "#94a3b8" }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
          <button
            onClick={() => setShowUserMenu(v => !v)}
            style={{ width: "100%", padding: "12px 14px", display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "background 0.1s", borderRadius: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#3b5bdb", color: "#fff", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {user?.initials ?? "??"}
            </span>
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#e2e8f0", lineHeight: "1.3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name ?? ""}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email ?? ""}</div>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#475569", flexShrink: 0 }}>expand_less</span>
          </button>

          {/* User dropdown */}
          {showUserMenu && (
            <div style={{ position: "absolute", bottom: "100%", left: 8, right: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden" }}>
              <button onClick={() => { navigate("/settings"); setShowUserMenu(false); }}
                style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "#334155", transition: "background 0.1s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#64748b" }}>settings</span>
                Settings
              </button>
              <div style={{ borderTop: "1px solid #f1f5f9" }} />
              <button onClick={handleLogout}
                style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "#ef4444", transition: "background 0.1s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 248, flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
        {/* Header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 40,
          background: "rgba(248,250,252,0.92)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          borderBottom: "1px solid #e2e8f0", padding: "0 32px", height: 56,
          display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
        }}>
          <h1 style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.02em", marginRight: 4, whiteSpace: "nowrap" }}>{title}</h1>
          <div style={{ flex: 1, maxWidth: 320, position: "relative" }}>
            <span className="material-symbols-outlined" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#94a3b8", pointerEvents: "none" }}>search</span>
            <input type="search" placeholder="Search deals, companies…" value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", height: 32, paddingLeft: 30, paddingRight: 10, border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 12.5, color: "#0f172a", background: "#fff", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s", fontFamily: "inherit" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#5c7cfa"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(92,124,250,0.1)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <IconBtn icon="notifications" badge />
            <IconBtn icon="help_outline" />
            {actions}
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function IconBtn({ icon, badge }: { icon: string; badge?: boolean }) {
  return (
    <button style={{ width: 32, height: 32, borderRadius: 4, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", transition: "background 0.1s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#475569" }}>{icon}</span>
      {badge && <span style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: "#ef4444", border: "1.5px solid #fff" }} />}
    </button>
  );
}

export function AddBtn({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 5, height: 32, padding: "0 13px",
      borderRadius: 4, border: "none", background: "#3b5bdb", color: "#fff",
      fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.12s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#2f4ac9"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#3b5bdb"; }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>add</span>
      {label}
    </button>
  );
}

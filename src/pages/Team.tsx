import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api, TeamMember } from "../lib/api";

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

const DEPT_COLORS: Record<string, string> = {
  Sales: "#3b5bdb", "Pre-Sales": "#8b5cf6", "Customer Success": "#10b981",
};

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.team.list().then(d => { setMembers(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const totalRevenue = members.reduce((s, m) => s + m.revenue, 0);
  const totalDeals = members.reduce((s, m) => s + m.dealsWon, 0);
  const activeCount = members.filter(m => m.status === "active").length;

  return (
    <Layout title="Team">
      <div style={{ padding: "20px 32px 40px" }}>
        {loading && <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading…</p>}

        {/* Team stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Members", value: members.length, icon: "people", color: "#3b5bdb" },
            { label: "Active Now", value: activeCount, icon: "fiber_manual_record", color: "#22c55e" },
            { label: "Combined Revenue", value: fmt(totalRevenue), icon: "paid", color: "#f59e0b", raw: true },
          ].map(k => (
            <div key={k.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 36, height: 36, borderRadius: 9, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: k.color, fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
              </span>
              <div>
                <p style={{ fontSize: 10.5, fontWeight: 600, color: "#94a3b8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                  {k.raw ? k.value : k.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Member cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {members.map(m => (
            <div key={m.id} style={{
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
              padding: "22px 20px", transition: "box-shadow 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(15,23,42,0.08)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "none"}
            >
              {/* Avatar + status */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ position: "relative" }}>
                  <span style={{
                    width: 48, height: 48, borderRadius: "50%", background: m.avatarColor,
                    color: "#fff", fontSize: 16, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{m.initials}</span>
                  <span style={{
                    position: "absolute", bottom: 1, right: 1, width: 12, height: 12,
                    borderRadius: "50%", background: m.status === "active" ? "#22c55e" : "#f59e0b",
                    border: "2px solid #fff",
                  }} />
                </div>
                <span style={{
                  fontSize: 10.5, fontWeight: 600, color: DEPT_COLORS[m.department ?? ""] ?? "#64748b",
                  background: `${DEPT_COLORS[m.department ?? ""] ?? "#64748b"}18`,
                  padding: "3px 8px", borderRadius: 4, letterSpacing: "0.03em",
                }}>{m.department}</span>
              </div>

              {/* Name + role */}
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 3px" }}>{m.name}</h3>
              <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 16px" }}>{m.role}</p>
              <p style={{ fontSize: 11.5, color: "#94a3b8", margin: "0 0 14px" }}>{m.email}</p>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                {[
                  { label: "Deals Won", value: m.dealsWon },
                  { label: "Revenue", value: fmt(m.revenue) },
                  { label: "Leads", value: m.leadsAssigned },
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 2px" }}>{stat.value}</p>
                    <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {!loading && members.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 48, color: "#94a3b8" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, display: "block", marginBottom: 10 }}>people</span>
              <p style={{ fontSize: 13, margin: 0 }}>No team members found.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

import { useEffect, useState } from "react";
import Layout, { AddBtn } from "../components/Layout";
import { api, DashboardData, Activity } from "../lib/api";

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

const ACTIVITY_ICONS: Record<string, { icon: string; bg: string; color: string }> = {
  call: { icon: "call", bg: "#eff6ff", color: "#3b82f6" },
  email: { icon: "mail", bg: "#f0fdf4", color: "#22c55e" },
  meeting: { icon: "groups", bg: "#fdf4ff", color: "#a855f7" },
  note: { icon: "sticky_note_2", bg: "#fffbeb", color: "#f59e0b" },
  deal_updated: { icon: "trending_up", bg: "#ecfdf5", color: "#10b981" },
  lead_created: { icon: "person_add", bg: "#eff6ff", color: "#3b5bdb" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STAGES = ["new", "contacted", "qualified", "negotiation", "proposal", "won"];
const STAGE_COLORS: Record<string, string> = {
  new: "#94a3b8", contacted: "#f59e0b", qualified: "#3b5bdb",
  negotiation: "#8b5cf6", proposal: "#f97316", won: "#22c55e",
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const kpis = data?.kpis;
  const stageData = data?.stageBreakdown ?? [];
  const maxCount = Math.max(...stageData.map(s => s.count), 1);

  return (
    <Layout title="Dashboard" actions={<AddBtn label="Add Lead" />}>
      <div style={{ padding: "24px 32px 40px" }}>
        {loading && <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading…</p>}

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          <KpiCard label="Total Leads" value={kpis?.totalLeads ?? 0} icon="group" color="#3b5bdb" suffix="" />
          <KpiCard label="Pipeline Value" value={kpis?.pipelineValue ?? 0} icon="payments" color="#8b5cf6" format={fmt} />
          <KpiCard label="Revenue Won" value={kpis?.totalRevenue ?? 0} icon="emoji_events" color="#10b981" format={fmt} />
          <KpiCard label="Active Deals" value={kpis?.activeDeals ?? 0} icon="view_kanban" color="#f59e0b" suffix="" />
          <KpiCard label="Win Rate" value={kpis?.conversionRate ?? 0} icon="percent" color="#06b6d4" suffix="%" />
          <KpiCard label="Open Tasks" value={kpis?.openTasks ?? 0} icon="task_alt" color="#f97316" suffix="" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
          {/* Pipeline stage breakdown */}
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
            padding: "20px 24px",
          }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 18 }}>Pipeline Stage Overview</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {STAGES.map(stage => {
                const s = stageData.find(d => d.stage === stage);
                const count = s?.count ?? 0;
                const value = s?.value ?? 0;
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={stage} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 90, fontSize: 12, fontWeight: 500, color: "#64748b", textTransform: "capitalize", textAlign: "right" }}>{stage}</span>
                    <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 4, height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: STAGE_COLORS[stage], borderRadius: 4, transition: "width 0.5s" }} />
                    </div>
                    <span style={{ width: 24, fontSize: 12, fontWeight: 600, color: "#334155" }}>{count}</span>
                    <span style={{ width: 70, fontSize: 12, color: "#64748b", textAlign: "right" }}>{fmt(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px 20px" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 16 }}>Recent Activity</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {(data?.recentActivities ?? []).slice(0, 6).map((a, i) => {
                const meta = ACTIVITY_ICONS[a.type] ?? ACTIVITY_ICONS.note;
                return (
                  <div key={a.id} style={{
                    display: "flex", gap: 10, paddingBottom: 13,
                    borderBottom: i < 5 ? "1px solid #f1f5f9" : "none",
                    marginBottom: i < 5 ? 13 : 0,
                  }}>
                    <span style={{ width: 28, height: 28, borderRadius: 7, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: meta.color }}>{meta.icon}</span>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 500, color: "#1e293b", lineHeight: "1.4", margin: 0 }}>{a.title}</p>
                      {a.leadName && <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>{a.leadName}</p>}
                    </div>
                    <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", flexShrink: 0 }}>{timeAgo(a.createdAt)}</span>
                  </div>
                );
              })}
              {!data && !loading && <p style={{ fontSize: 13, color: "#94a3b8" }}>No activity yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function KpiCard({ label, value, icon, color, suffix = "", format }: {
  label: string; value: number; icon: string; color: string; suffix?: string; format?: (n: number) => string;
}) {
  const display = format ? format(value) : `${value.toLocaleString()}${suffix}`;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
      <span style={{ width: 36, height: 36, borderRadius: 9, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </span>
      <div>
        <p style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 600, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>{display}</p>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api, AnalyticsData } from "../lib/api";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

const STAGE_COLORS: Record<string, string> = {
  New: "#94a3b8", Contacted: "#f59e0b", Qualified: "#3b5bdb",
  Negotiation: "#8b5cf6", Proposal: "#f97316", Won: "#22c55e",
};

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.analytics().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const s = data?.summary;

  return (
    <Layout title="Analytics">
      <div style={{ padding: "20px 32px 40px" }}>
        {loading && <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading…</p>}

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Revenue", value: fmt(s?.totalRevenue ?? 0), icon: "paid", color: "#10b981" },
            { label: "Avg Deal Size", value: fmt(s?.avgDealSize ?? 0), icon: "bar_chart", color: "#3b5bdb" },
            { label: "Win Rate", value: `${s?.winRate ?? 0}%`, icon: "emoji_events", color: "#f59e0b" },
            { label: "Total Leads", value: String(s?.totalLeads ?? 0), icon: "group", color: "#8b5cf6" },
          ].map(k => (
            <div key={k.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 19, color: k.color, fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
              </span>
              <div>
                <p style={{ fontSize: 10.5, fontWeight: 600, color: "#94a3b8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
                <p style={{ fontSize: 21, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>{k.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Monthly Revenue chart */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px 24px" }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>Monthly Revenue</h2>
            <p style={{ fontSize: 11.5, color: "#94a3b8", marginBottom: 20 }}>Revenue trend over the last 12 months</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data?.monthlyRevenue ?? []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b5bdb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b5bdb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={48} />
                <Tooltip formatter={(v: number) => [fmt(v), "Revenue"]} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b5bdb" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: "#3b5bdb" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pipeline Funnel */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px 24px" }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>Pipeline Funnel</h2>
            <p style={{ fontSize: 11.5, color: "#94a3b8", marginBottom: 20 }}>Lead count by stage</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.funnel ?? []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={(v: number) => [v, "Leads"]} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  {(data?.funnel ?? []).map((entry) => (
                    <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] ?? "#3b5bdb"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Deals by month bar */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px 24px" }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>Deals Closed per Month</h2>
            <p style={{ fontSize: 11.5, color: "#94a3b8", marginBottom: 20 }}>Number of closed deals by month</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data?.monthlyRevenue ?? []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip formatter={(v: number) => [v, "Deals"]} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="deals" fill="#5c7cfa" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Priority breakdown */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px 24px" }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", marginBottom: 16 }}>Leads by Priority</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(data?.priorityBreakdown ?? []).map(p => {
                const total = (data?.priorityBreakdown ?? []).reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
                const colors: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
                return (
                  <div key={p.priority}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#334155", textTransform: "capitalize" }}>{p.priority}</span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{p.count} leads · {fmt(p.value)}</span>
                    </div>
                    <div style={{ background: "#f1f5f9", borderRadius: 4, height: 7, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: colors[p.priority] ?? "#3b5bdb", borderRadius: 4, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
              {(!data || data.priorityBreakdown.every(p => p.count === 0)) && (
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>No data yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

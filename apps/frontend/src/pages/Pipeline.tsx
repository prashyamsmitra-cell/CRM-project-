import { useEffect, useState } from "react";
import Layout, { AddBtn } from "../components/Layout";
import { api, Lead } from "../lib/api";

const STAGES = [
  { id: "new", label: "NEW", dotColor: "#94a3b8" },
  { id: "contacted", label: "CONTACTED", dotColor: "#f59e0b" },
  { id: "qualified", label: "QUALIFIED", dotColor: "#3b5bdb" },
  { id: "negotiation", label: "NEGOTIATION", dotColor: "#8b5cf6" },
  { id: "proposal", label: "PROPOSAL", dotColor: "#f97316" },
  { id: "won", label: "WON", dotColor: "#22c55e" },
];

const PRIORITY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  high: { bg: "#fff0f0", color: "#ef4444", border: "#fecaca" },
  medium: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  low: { bg: "#f0fdf9", color: "#059669", border: "#a7f3d0" },
  closed: { bg: "#eff6ff", color: "#3b5bdb", border: "#bfdbfe" },
};

function fmt(v: number) { return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`; }

export default function Pipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<Lead | null>(null);
  const [draggingOver, setDraggingOver] = useState<string | null>(null);

  const load = () => api.leads.list().then(d => { setLeads(d.filter(l => l.stage !== "lost")); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleDrop = async (targetStage: string) => {
    if (!dragging || dragging.stage === targetStage) { setDragging(null); setDraggingOver(null); return; }
    await api.leads.update(dragging.id, { stage: targetStage });
    setDragging(null);
    setDraggingOver(null);
    load();
  };

  return (
    <Layout title="Pipeline" actions={<AddBtn label="Add Lead" />}>
      <div style={{ padding: "20px 24px 32px", height: "calc(100% - 0px)", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 14, minWidth: "max-content", alignItems: "flex-start" }}>
          {STAGES.map(col => {
            const colLeads = leads.filter(l => l.stage === col.id);
            const total = colLeads.reduce((s, l) => s + l.value, 0);
            const isOver = draggingOver === col.id;
            return (
              <div key={col.id} style={{ width: 288, flexShrink: 0 }}
                onDragOver={e => { e.preventDefault(); setDraggingOver(col.id); }}
                onDragLeave={() => setDraggingOver(null)}
                onDrop={() => handleDrop(col.id)}
              >
                {/* Column header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, paddingBottom: 9, borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: col.dotColor, flexShrink: 0, display: "inline-block" }} />
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em" }}>{col.label}</span>
                    <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 10.5, fontWeight: 600, borderRadius: 4, padding: "1px 6px" }}>{colLeads.length}</span>
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: "#334155" }}>{fmt(total)}</span>
                </div>

                {/* Cards */}
                <div style={{
                  display: "flex", flexDirection: "column", gap: 8, minHeight: 80,
                  background: isOver ? "#f0f4ff" : "transparent", borderRadius: 8,
                  transition: "background 0.15s", padding: isOver ? 4 : 0,
                }}>
                  {colLeads.map(lead => {
                    const ps = PRIORITY_STYLE[lead.priority] ?? PRIORITY_STYLE.medium;
                    return (
                      <div key={lead.id} draggable
                        onDragStart={() => setDragging(lead)}
                        onDragEnd={() => { setDragging(null); setDraggingOver(null); }}
                        style={{
                          background: "#fff", border: `1px solid ${dragging?.id === lead.id ? "#5c7cfa" : "#e2e8f0"}`,
                          borderRadius: 8, padding: "12px 13px",
                          boxShadow: dragging?.id === lead.id ? "0 6px 20px rgba(59,91,219,0.15)" : "0 1px 3px rgba(15,23,42,0.05)",
                          cursor: "grab", transition: "box-shadow 0.15s, border-color 0.15s, transform 0.1s",
                          opacity: dragging?.id === lead.id ? 0.7 : 1,
                          transform: dragging?.id === lead.id ? "scale(1.02)" : "scale(1)",
                          userSelect: "none",
                        }}
                        onMouseEnter={e => { if (dragging?.id !== lead.id) { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(15,23,42,0.10)"; } }}
                        onMouseLeave={e => { if (dragging?.id !== lead.id) { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(15,23,42,0.05)"; } }}
                      >
                        {/* Top row */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 7 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b", lineHeight: "1.3", flex: 1 }}>{lead.company}</span>
                          <span style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.border}`, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", borderRadius: 3, padding: "1px 6px", flexShrink: 0, textTransform: "uppercase" }}>
                            {lead.priority}
                          </span>
                        </div>
                        {/* Contact */}
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13, color: "#94a3b8" }}>person</span>
                          <span style={{ fontSize: 12, color: "#64748b" }}>{lead.name}</span>
                        </div>
                        {/* Bottom row */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 9, borderTop: "1px solid #f1f5f9" }}>
                          <div>
                            <span style={{ fontSize: 10, color: "#94a3b8", display: "block", marginBottom: 1 }}>Value</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>${lead.value.toLocaleString()}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>{lead.dueDate}</span>
                            <span style={{ width: 24, height: 24, borderRadius: "50%", background: lead.assignedToColor, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {lead.assignedToInitials}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {colLeads.length === 0 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0", border: "1.5px dashed #e2e8f0", borderRadius: 8, color: "#cbd5e1" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 22, marginBottom: 4 }}>inbox</span>
                      <span style={{ fontSize: 11, fontWeight: 500 }}>Drop cards here</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

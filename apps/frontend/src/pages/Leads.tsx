import { useEffect, useState } from "react";
import Layout, { AddBtn } from "../components/Layout";
import { api, Lead } from "../lib/api";

const STAGES = ["all", "new", "contacted", "qualified", "negotiation", "proposal", "won", "lost"];
const PRIORITY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  high: { bg: "#fff0f0", color: "#ef4444", border: "#fecaca" },
  medium: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  low: { bg: "#f0fdf9", color: "#059669", border: "#a7f3d0" },
  closed: { bg: "#f0f9ff", color: "#3b5bdb", border: "#bfdbfe" },
};
const STAGE_STYLE: Record<string, { bg: string; color: string }> = {
  new: { bg: "#f8fafc", color: "#64748b" },
  contacted: { bg: "#fffbeb", color: "#b45309" },
  qualified: { bg: "#eff6ff", color: "#1d4ed8" },
  negotiation: { bg: "#faf5ff", color: "#7c3aed" },
  proposal: { bg: "#fff7ed", color: "#c2410c" },
  won: { bg: "#f0fdf4", color: "#15803d" },
  lost: { bg: "#fef2f2", color: "#b91c1c" },
};

function fmt(n: number) { return `$${n.toLocaleString()}`; }

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", email: "", company: "", phone: "", stage: "new", priority: "medium", value: 0, source: "", dueDate: "", notes: "" });

  const load = () => api.leads.list().then(d => { setLeads(d); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = leads.filter(l => {
    const matchStage = stage === "all" || l.stage === stage;
    const q = search.toLowerCase();
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
    return matchStage && matchSearch;
  });

  const handleCreate = async () => {
    await api.leads.create({ ...newLead, value: Number(newLead.value), assignedToName: "Alex Sterling", assignedToInitials: "AS", assignedToColor: "#3b5bdb" });
    setShowModal(false);
    setNewLead({ name: "", email: "", company: "", phone: "", stage: "new", priority: "medium", value: 0, source: "", dueDate: "", notes: "" });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this lead?")) return;
    await api.leads.delete(id);
    load();
  };

  const handleStageChange = async (id: number, newStage: string) => {
    await api.leads.update(id, { stage: newStage });
    load();
  };

  return (
    <Layout title="Leads" actions={<AddBtn label="Add Lead" onClick={() => setShowModal(true)} />}>
      <div style={{ padding: "20px 32px 40px" }}>
        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          {/* Stage tabs */}
          <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, padding: 3 }}>
            {STAGES.map(s => (
              <button key={s} onClick={() => setStage(s)} style={{
                padding: "4px 10px", borderRadius: 4, border: "none", cursor: "pointer",
                background: stage === s ? "#3b5bdb" : "transparent",
                color: stage === s ? "#fff" : "#64748b", fontSize: 12, fontWeight: 500,
                fontFamily: "inherit", transition: "all 0.1s", textTransform: "capitalize",
              }}>
                {s === "all" ? "All" : s}
                {s !== "all" && <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.8 }}>
                  {leads.filter(l => l.stage === s).length}
                </span>}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ position: "relative" }}>
            <span className="material-symbols-outlined" style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#94a3b8" }}>search</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads…"
              style={{ paddingLeft: 28, height: 30, border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 12, color: "#0f172a", background: "#fff", outline: "none", fontFamily: "inherit", width: 200 }}
              onFocus={e => { e.currentTarget.style.borderColor = "#5c7cfa"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["Contact", "Company", "Stage", "Priority", "Value", "Assigned To", "Due Date", ""].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No leads found.</td></tr>}
              {filtered.map((lead) => {
                const ps = PRIORITY_STYLE[lead.priority] ?? PRIORITY_STYLE.medium;
                const ss = STAGE_STYLE[lead.stage] ?? STAGE_STYLE.new;
                return (
                  <tr key={lead.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc"}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fff"}
                  >
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <span style={{ width: 28, height: 28, borderRadius: "50%", background: lead.assignedToColor, color: "#fff", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {lead.assignedToInitials || lead.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: "#1e293b", margin: 0 }}>{lead.name}</p>
                          <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 500, color: "#334155" }}>{lead.company}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <select value={lead.stage} onChange={e => handleStageChange(lead.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        style={{ background: ss.bg, color: ss.color, border: "1px solid #e2e8f0", borderRadius: 4, padding: "2px 6px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>
                        {["new","contacted","qualified","negotiation","proposal","won","lost"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.border}`, fontSize: 11, fontWeight: 600, borderRadius: 4, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                        {lead.priority}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{fmt(lead.value)}</td>
                    <td style={{ padding: "11px 14px" }}>
                      {lead.assignedToName && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 22, height: 22, borderRadius: "50%", background: lead.assignedToColor, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{lead.assignedToInitials}</span>
                          <span style={{ fontSize: 12, color: "#475569" }}>{lead.assignedToName}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b" }}>{lead.dueDate}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, borderRadius: 4, transition: "color 0.1s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Lead Modal */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowModal(false)}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 500, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: 0 }}>Add New Lead</h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Full Name *", key: "name", type: "text" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "Company *", key: "company", type: "text" },
                  { label: "Phone", key: "phone", type: "text" },
                  { label: "Deal Value ($)", key: "value", type: "number" },
                  { label: "Due Date", key: "dueDate", type: "text", placeholder: "e.g. Oct 30" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</label>
                    <input
                      type={f.type} placeholder={f.placeholder}
                      value={(newLead as Record<string,unknown>)[f.key] as string}
                      onChange={e => setNewLead(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ width: "100%", height: 34, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 13, color: "#0f172a", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                      onFocus={e => { e.currentTarget.style.borderColor = "#5c7cfa"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Stage</label>
                  <select value={newLead.stage} onChange={e => setNewLead(p => ({ ...p, stage: e.target.value }))}
                    style={{ width: "100%", height: 34, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 13, color: "#0f172a", outline: "none", fontFamily: "inherit", background: "#fff" }}>
                    {["new","contacted","qualified","negotiation","proposal","won"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Priority</label>
                  <select value={newLead.priority} onChange={e => setNewLead(p => ({ ...p, priority: e.target.value }))}
                    style={{ width: "100%", height: 34, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 13, color: "#0f172a", outline: "none", fontFamily: "inherit", background: "#fff" }}>
                    {["high","medium","low"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Notes</label>
                <textarea value={newLead.notes} onChange={e => setNewLead(p => ({ ...p, notes: e.target.value }))} rows={2}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 13, color: "#0f172a", outline: "none", fontFamily: "inherit", resize: "none", boxSizing: "border-box" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#5c7cfa"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
                />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
                <button onClick={() => setShowModal(false)} style={{ height: 34, padding: "0 16px", borderRadius: 4, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", color: "#475569" }}>Cancel</button>
                <button onClick={handleCreate} disabled={!newLead.name || !newLead.company}
                  style={{ height: 34, padding: "0 16px", borderRadius: 4, border: "none", background: newLead.name && newLead.company ? "#3b5bdb" : "#94a3b8", color: "#fff", fontSize: 13, fontWeight: 600, cursor: newLead.name && newLead.company ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                  Create Lead
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

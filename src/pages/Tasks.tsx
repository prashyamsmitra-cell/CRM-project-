import { useEffect, useState } from "react";
import Layout, { AddBtn } from "../components/Layout";
import { api, Task } from "../lib/api";

const STATUS_TABS = ["all", "todo", "in-progress", "done"];
const PRIORITY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  high:   { bg: "#fff0f0", color: "#ef4444", border: "#fecaca" },
  medium: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  low:    { bg: "#f0fdf9", color: "#059669", border: "#a7f3d0" },
};
const STATUS_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  "todo":        { bg: "#f8fafc", color: "#64748b", icon: "radio_button_unchecked" },
  "in-progress": { bg: "#eff6ff", color: "#3b5bdb", icon: "pending" },
  "done":        { bg: "#f0fdf4", color: "#15803d", icon: "check_circle" },
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", dueDate: "", assignedToName: "Alex Sterling", assignedToInitials: "AS" });

  const load = () => api.tasks.list().then(d => { setTasks(d); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = tasks.filter(t => filter === "all" || t.status === filter);

  const toggle = async (task: Task) => {
    const next = task.status === "done" ? "todo" : task.status === "todo" ? "in-progress" : "done";
    await api.tasks.update(task.id, { status: next });
    load();
  };

  const handleCreate = async () => {
    await api.tasks.create({ ...form });
    setShowModal(false);
    setForm({ title: "", description: "", priority: "medium", dueDate: "", assignedToName: "Alex Sterling", assignedToInitials: "AS" });
    load();
  };

  const handleDelete = async (id: number) => {
    await api.tasks.delete(id);
    load();
  };

  return (
    <Layout title="Tasks" actions={<AddBtn label="New Task" onClick={() => setShowModal(true)} />}>
      <div style={{ padding: "20px 32px 40px" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {STATUS_TABS.slice(1).map(s => {
            const cnt = tasks.filter(t => t.status === s).length;
            const st = STATUS_STYLE[s];
            return (
              <div key={s} onClick={() => setFilter(s)} style={{
                background: "#fff", border: `1.5px solid ${filter === s ? "#3b5bdb" : "#e2e8f0"}`,
                borderRadius: 8, padding: "11px 16px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10, transition: "border-color 0.1s",
                minWidth: 140,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: st.color, fontVariationSettings: "'FILL' 1" }}>{st.icon}</span>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>{cnt}</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, textTransform: "capitalize" }}>{s.replace("-", " ")}</p>
                </div>
              </div>
            );
          })}
          <div onClick={() => setFilter("all")} style={{
            background: filter === "all" ? "#eff6ff" : "#fff", border: `1.5px solid ${filter === "all" ? "#3b5bdb" : "#e2e8f0"}`,
            borderRadius: 8, padding: "11px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#3b5bdb", fontVariationSettings: "'FILL' 1" }}>list</span>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>{tasks.length}</p>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>All Tasks</p>
            </div>
          </div>
        </div>

        {/* Task list */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
          {loading && <p style={{ padding: 24, color: "#94a3b8", fontSize: 13, margin: 0 }}>Loading…</p>}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 36, display: "block", marginBottom: 8 }}>task_alt</span>
              <p style={{ fontSize: 13, margin: 0 }}>No tasks in this category.</p>
            </div>
          )}
          {filtered.map((task, i) => {
            const ps = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.medium;
            const ss = STATUS_STYLE[task.status] ?? STATUS_STYLE.todo;
            return (
              <div key={task.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "13px 18px",
                borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                transition: "background 0.1s", cursor: "pointer",
                opacity: task.status === "done" ? 0.6 : 1,
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "#fff"}
              >
                {/* Status toggle */}
                <button onClick={() => toggle(task)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: ss.color, fontVariationSettings: "'FILL' 1" }}>{ss.icon}</span>
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: "#1e293b", margin: 0, lineHeight: "1.3", textDecoration: task.status === "done" ? "line-through" : "none" }}>
                    {task.title}
                  </p>
                  {task.leadName && (
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 11, verticalAlign: "middle" }}>link</span> {task.leadName}
                    </p>
                  )}
                </div>

                {/* Priority */}
                <span style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.border}`, fontSize: 10.5, fontWeight: 600, borderRadius: 4, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {task.priority}
                </span>

                {/* Assigned */}
                {task.assignedToInitials && (
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#3b5bdb", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {task.assignedToInitials}
                  </span>
                )}

                {/* Due date */}
                {task.dueDate && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "#94a3b8", minWidth: 70 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>calendar_today</span>
                    {task.dueDate}
                  </div>
                )}

                {/* Delete */}
                <button onClick={() => handleDelete(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", padding: 4, transition: "color 0.1s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "#cbd5e1"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowModal(false)}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 }}>New Task</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Task Title *", key: "title" },
                { label: "Description", key: "description" },
                { label: "Due Date", key: "dueDate", placeholder: "e.g. Oct 30" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</label>
                  <input value={(form as Record<string,string>)[f.key]} placeholder={f.placeholder}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", height: 34, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 13, color: "#0f172a", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#5c7cfa"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Priority</label>
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                  style={{ width: "100%", height: 34, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 13, color: "#0f172a", outline: "none", fontFamily: "inherit", background: "#fff" }}>
                  {["high","medium","low"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={{ height: 34, padding: "0 16px", borderRadius: 4, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#475569" }}>Cancel</button>
              <button onClick={handleCreate} disabled={!form.title}
                style={{ height: 34, padding: "0 16px", borderRadius: 4, border: "none", background: form.title ? "#3b5bdb" : "#94a3b8", color: "#fff", fontSize: 13, fontWeight: 600, cursor: form.title ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}/api${normalizedPath}`;
}

export interface Lead {
  id: number;
  userId: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  stage: string;
  priority: string;
  value: number;
  source: string;
  assignedToName: string;
  assignedToInitials: string;
  assignedToColor: string;
  notes: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  userId: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignedToName: string;
  assignedToInitials: string;
  leadId: number | null;
  leadName: string;
  createdAt: string;
}

export interface Activity {
  id: number;
  userId: number;
  type: string;
  title: string;
  description: string;
  leadId: number | null;
  leadName: string;
  userName: string;
  userInitials: string;
  userColor: string;
  createdAt: string;
}

export interface TeamMember {
  id: number;
  userId: number;
  name: string;
  email: string;
  role: string;
  department: string;
  initials: string;
  avatarColor: string;
  status: string;
  dealsWon: number;
  revenue: number;
  leadsAssigned: number;
  createdAt: string;
}

export interface DashboardData {
  kpis: {
    totalLeads: number; totalRevenue: number; activeDeals: number;
    pipelineValue: number; conversionRate: number; openTasks: number; wonDeals: number;
  };
  stageBreakdown: { stage: string; count: number; value: number }[];
  recentActivities: Activity[];
}

export interface AnalyticsData {
  monthlyRevenue: { month: string; revenue: number; deals: number }[];
  funnel: { stage: string; count: number; value: number }[];
  sourceBreakdown: { source: string; count: number; percentage: number }[];
  priorityBreakdown: { priority: string; count: number; value: number }[];
  summary: { totalRevenue: number; avgDealSize: number; winRate: number; totalLeads: number };
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(buildApiUrl(path), {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (res.status === 401) {
    // Force re-auth by reloading — AuthContext will catch 401 on /auth/me
    window.location.href = "/";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  dashboard: () => request<DashboardData>("/dashboard"),
  analytics: () => request<AnalyticsData>("/analytics"),
  leads: {
    list: () => request<Lead[]>("/leads"),
    create: (data: Partial<Lead>) => request<Lead>("/leads", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Lead>) => request<Lead>(`/leads/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/leads/${id}`, { method: "DELETE" }),
  },
  tasks: {
    list: () => request<Task[]>("/tasks"),
    create: (data: Partial<Task>) => request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Task>) => request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
  },
  team: {
    list: () => request<TeamMember[]>("/team"),
    create: (data: Partial<TeamMember>) => request<TeamMember>("/team", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<TeamMember>) => request<TeamMember>(`/team/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/team/${id}`, { method: "DELETE" }),
  },
  activities: {
    list: (limit = 20) => request<Activity[]>(`/activities?limit=${limit}`),
  },
};

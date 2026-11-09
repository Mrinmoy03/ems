// WorkTrack Enterprise API Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function getToken(): string | null {
  return localStorage.getItem("worktrack_token");
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Authentication
  auth: {
    login: (credentials: { emailOrId: string; password: string }) =>
      request<{ success: boolean; token: string; user: any; message: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    me: () => request<{ success: boolean; user: any }>("/auth/me"),
    logout: () =>
      request<{ success: boolean; message: string }>("/auth/logout", {
        method: "POST",
      }),
  },

  // Employees & Credentials
  employees: {
    getAll: () => request<{ success: boolean; employees: any[] }>("/employees"),
    getById: (id: string) => request<{ success: boolean; employee: any }>(`/employees/${id}`),
    create: (employeeData: any) =>
      request<{ success: boolean; message: string; employee: any }>("/employees", {
        method: "POST",
        body: JSON.stringify(employeeData),
      }),
    update: (id: string, employeeData: any) =>
      request<{ success: boolean; message: string; employee?: any }>(`/employees/${id}`, {
        method: "PUT",
        body: JSON.stringify(employeeData),
      }),
    updatePassword: (id: string, newPassword: string) =>
      request<{ success: boolean; message: string }>(`/employees/${id}/password`, {
        method: "PUT",
        body: JSON.stringify({ newPassword }),
      }),
  },

  // Projects & Weighted Packages
  projects: {
    getAll: () => request<{ success: boolean; projects: any[] }>("/projects"),
    getById: (id: string) => request<{ success: boolean; project: any }>(`/projects/${id}`),
    create: (projectData: any) =>
      request<{ success: boolean; message: string; projectId: string }>("/projects", {
        method: "POST",
        body: JSON.stringify(projectData),
      }),
    updatePartProgress: (partId: string, progress: number, status?: string) =>
      request<{ success: boolean; message: string; overallProgress: number }>(
        `/projects/parts/${partId}/progress`,
        {
          method: "PATCH",
          body: JSON.stringify({ progress, status }),
        }
      ),
  },

  // Tasks & Deliverables (NO allocatedTime allowed)
  tasks: {
    getAll: (params?: Record<string, string>) => {
      const search = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ success: boolean; tasks: any[] }>(`/tasks${search}`);
    },
    create: (taskData: any) =>
      request<{ success: boolean; message: string; taskId: string }>("/tasks", {
        method: "POST",
        body: JSON.stringify(taskData),
      }),
    updateProgress: (taskId: string, progress: number, delayReason?: string) =>
      request<{ success: boolean; message: string; status: string; progress: number }>(
        `/tasks/${taskId}/progress`,
        {
          method: "PATCH",
          body: JSON.stringify({ progress, delayReason }),
        }
      ),
    updateDeadline: (taskId: string, deadline: string, reason: string) =>
      request<{ success: boolean; message: string; deadline: string }>(
        `/tasks/${taskId}/deadline`,
        {
          method: "PATCH",
          body: JSON.stringify({ deadline, reason }),
        }
      ),
    delete: (taskId: string) =>
      request<{ success: boolean; message: string }>(`/tasks/${taskId}`, {
        method: "DELETE",
      }),
  },

  // Attendance & Time Logging
  attendance: {
    getAll: (params?: Record<string, string>) => {
      const search = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ success: boolean; attendance: any[] }>(`/attendance${search}`);
    },
    punchIn: (employeeId: string) =>
      request<{ success: boolean; message: string; punchInTime: string }>("/attendance/punch-in", {
        method: "POST",
        body: JSON.stringify({ employeeId }),
      }),
    punchOut: (employeeId: string) =>
      request<{ success: boolean; message: string; punchOutTime: string; durationSeconds: number }>(
        "/attendance/punch-out",
        {
          method: "POST",
          body: JSON.stringify({ employeeId }),
        }
      ),
  },

  // Leave Management (Super Admin Decision Authority)
  leave: {
    getAll: (params?: Record<string, string>) => {
      const search = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ success: boolean; leaves: any[] }>(`/leave${search}`);
    },
    apply: (leaveData: any) =>
      request<{ success: boolean; message: string; leaveId: string }>("/leave", {
        method: "POST",
        body: JSON.stringify(leaveData),
      }),
    decide: (leaveId: string, decision: "approved" | "rejected", remarks?: string) =>
      request<{ success: boolean; message: string; status: string }>(`/leave/${leaveId}/decision`, {
        method: "PUT",
        body: JSON.stringify({ decision, remarks }),
      }),
  },

  // EOD Reports & PDF Exports
  reports: {
    getEod: (params?: Record<string, string>) => {
      const search = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ success: boolean; reports: any[]; pagination: any }>(`/reports/eod${search}`);
    },
    submitEod: (reportData: any) =>
      request<{ success: boolean; message: string; reportId: string }>("/reports/eod", {
        method: "POST",
        body: JSON.stringify(reportData),
      }),
    getPdfDownloadUrl: (reportId?: string, employeeId?: string, date?: string) => {
      const params = new URLSearchParams();
      if (reportId) params.append("reportId", reportId);
      if (employeeId) params.append("employeeId", employeeId);
      if (date) params.append("date", date);
      return `${API_BASE_URL}/reports/eod/pdf?${params.toString()}`;
    },
  },

  // Departments
  departments: {
    getAll: () => request<{ success: boolean; departments: any[] }>("/departments"),
    create: (deptData: any) =>
      request<{ success: boolean; message: string; departmentId: string }>("/departments", {
        method: "POST",
        body: JSON.stringify(deptData),
      }),
    update: (id: string, deptData: any) =>
      request<{ success: boolean; message: string }>(`/departments/${id}`, {
        method: "PUT",
        body: JSON.stringify(deptData),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/departments/${id}`, {
        method: "DELETE",
      }),
    archive: (id: string, isArchived: boolean = true) =>
      request<{ success: boolean; message: string }>(`/departments/${id}/archive`, {
        method: "PATCH",
        body: JSON.stringify({ isArchived }),
      }),
    restore: (id: string) =>
      request<{ success: boolean; message: string }>(`/departments/${id}/archive`, {
        method: "PATCH",
        body: JSON.stringify({ isArchived: false }),
      }),
  },

  // Notifications (Live Backend Integration)
  notifications: {
    getAll: () =>
      request<{ success: boolean; notifications: any[]; unreadCount: number }>("/notifications"),
    markRead: (id: string) =>
      request<{ success: boolean; message: string }>(`/notifications/${id}/read`, {
        method: "PATCH",
      }),
    markAllRead: () =>
      request<{ success: boolean; message: string }>("/notifications/read-all", {
        method: "PATCH",
      }),
    create: (payload: { title: string; message: string; type?: string; roleTarget?: string; userId?: string }) =>
      request<{ success: boolean; message: string; notificationId: string }>("/notifications", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
};


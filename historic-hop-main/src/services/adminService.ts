import { api } from "@/lib/api";

export const adminService = {
  getStats: (token: string) => api.apiCall("/admin/stats", { token }),
  
  // Periods
  getPeriods: (token: string) => api.apiCall("/admin/periods", { token }),
  createPeriod: (token: string, data: any) => api.apiCall("/admin/periods", { method: "POST", body: data, token }),
  updatePeriod: (token: string, id: string, data: any) => api.apiCall(`/admin/periods/${id}`, { method: "PUT", body: data, token }),
  deletePeriod: (token: string, id: string) => api.apiCall(`/admin/periods/${id}`, { method: "DELETE", token }),

  // Activities
  getActivities: (token: string, periodId?: string, type?: string) => {
    let url = "/admin/activities";
    const params = new URLSearchParams();
    if (periodId) params.append("periodId", periodId);
    if (type) params.append("type", type);
    if (params.toString()) url += `?${params.toString()}`;
    return api.apiCall(url, { token });
  },
  createActivity: (token: string, data: any) => api.apiCall("/admin/activities", { method: "POST", body: data, token }),
  updateActivity: (token: string, id: string, data: any) => api.apiCall(`/admin/activities/${id}`, { method: "PUT", body: data, token }),
  deleteActivity: (token: string, id: string) => api.apiCall(`/admin/activities/${id}`, { method: "DELETE", token }),

  // IA
  generateWithAI: (token: string, periodId: string, type: string, level: number) => 
    api.apiCall("/admin/generate-activity", { method: "POST", body: { periodId, type, level }, token }),
  // Usuários
  getUsers: (token: string) => api.apiCall("/admin/users", { token }),
};

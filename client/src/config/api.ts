/**
 * WorkTrack Backend API Configuration & Endpoints
 * 
 * Centralized API configuration for connecting the frontend with the backend server.
 * Uses environment variable VITE_API_BASE_URL with a clean default fallback.
 */

export const API_CONFIG = {
  baseUrl: (import.meta as any).env?.VITE_API_BASE_URL || "/api",
  timeoutMs: 15000,
}

export const API_ENDPOINTS = {
  // Employee Profile & Auth
  auth: {
    me: `${API_CONFIG.baseUrl}/auth/me`,
    login: `${API_CONFIG.baseUrl}/auth/login`,
    logout: `${API_CONFIG.baseUrl}/auth/logout`,
  },
  employee: {
    profile: `${API_CONFIG.baseUrl}/employee/profile`,
    updateAvatar: `${API_CONFIG.baseUrl}/employee/avatar`,
    notifications: `${API_CONFIG.baseUrl}/employee/notifications`,
    markNotificationRead: (id: string) => `${API_CONFIG.baseUrl}/employee/notifications/${id}/read`,
  },
  // Task Management
  tasks: {
    list: `${API_CONFIG.baseUrl}/tasks`,
    create: `${API_CONFIG.baseUrl}/tasks`,
    detail: (id: string) => `${API_CONFIG.baseUrl}/tasks/${id}`,
    updateProgress: (id: string) => `${API_CONFIG.baseUrl}/tasks/${id}/progress`,
    complete: (id: string) => `${API_CONFIG.baseUrl}/tasks/${id}/complete`,
    history: `${API_CONFIG.baseUrl}/tasks/history`,
  },
  // Attendance & Live Shift Tracking
  attendance: {
    startShift: `${API_CONFIG.baseUrl}/attendance/start-shift`,
    recordBreak: `${API_CONFIG.baseUrl}/attendance/break`,
    logoutShift: `${API_CONFIG.baseUrl}/attendance/logout-shift`,
    timesheet: `${API_CONFIG.baseUrl}/attendance/timesheet`,
    workingDays: `${API_CONFIG.baseUrl}/attendance/working-days`,
  },
  // Leave Management
  leave: {
    balances: (year?: string | number) => `${API_CONFIG.baseUrl}/leave/balances${year ? `?year=${year}` : ""}`,
    requests: (year?: string | number) => `${API_CONFIG.baseUrl}/leave/requests${year ? `?year=${year}` : ""}`,
    apply: `${API_CONFIG.baseUrl}/leave/apply`,
    update: (id: string) => `${API_CONFIG.baseUrl}/leave/requests/${id}`,
    cancel: (id: string) => `${API_CONFIG.baseUrl}/leave/requests/${id}/cancel`,
  },
  // Reports & EOD Summaries
  reports: {
    monthly: (monthKey: string) => `${API_CONFIG.baseUrl}/reports/monthly/${monthKey}`,
    eodList: (monthKey: string) => `${API_CONFIG.baseUrl}/reports/eod?monthKey=${monthKey}`,
    submitEod: `${API_CONFIG.baseUrl}/reports/eod`,
  },
} as const

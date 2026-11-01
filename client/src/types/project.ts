export type ProjectStatus = "planning" | "in-progress" | "on-hold" | "completed" | "archived"
export type ProjectPriority = "low" | "medium" | "high" | "urgent"
export type ProjectPartStatus = "planning" | "in-progress" | "completed" | "overdue" | "on-hold"

export interface ProjectLink {
  id: string
  label: string
  url: string
  type: "live" | "staging" | "repository" | "figma" | "docs" | "other"
}

export interface ProjectActivity {
  id: string
  projectId: string
  action: string
  description: string
  performedBy: string
  timestamp: string
}

export interface ProjectPart {
  id: string
  projectId: string
  name: string
  description?: string
  weight: number // 0 to 100 percentage contribution to project
  assignedDepartmentId?: string
  assignedDepartmentName?: string
  assignedEmployeeIds: string[]
  assignedEmployeeNames?: string[]
  startDate?: string
  deadline: string // ISO date string
  progress: number // 0 to 100
  status: ProjectPartStatus
  notes?: string
  order: number
}

export interface Project {
  id: string
  name: string
  code: string // Unique identifier, e.g. "WT-ECS"
  clientName?: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  startDate: string
  deadline: string
  projectOwnerId: string
  projectOwnerName: string
  assignedDepartmentIds: string[]
  assignedDepartmentNames?: string[]
  assignedEmployeeIds: string[]
  assignedEmployeeNames?: string[]
  parts: ProjectPart[]
  links: ProjectLink[]
  activities: ProjectActivity[]
  createdAt: string
  updatedAt: string
}

export interface CreateProjectInput {
  name: string
  code: string
  clientName?: string
  description: string
  priority: ProjectPriority
  status?: ProjectStatus
  startDate: string
  deadline: string
  projectOwnerId: string
  projectOwnerName: string
  assignedDepartmentIds: string[]
  assignedEmployeeIds: string[]
  links?: Omit<ProjectLink, "id">[]
}

export interface CreateProjectPartInput {
  projectId: string
  name: string
  description?: string
  weight: number
  assignedDepartmentId?: string
  assignedEmployeeIds: string[]
  startDate?: string
  deadline: string
  notes?: string
}


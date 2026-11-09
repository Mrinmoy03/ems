import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react"
import {
  Project,
  ProjectPart,
  ProjectLink,
  ProjectActivity,
  CreateProjectInput,
  CreateProjectPartInput,
} from "../types/project"
import { initialMockProjects } from "../data/mockProjects"
import {
  validateProjectWeights,
  calculateOverallProjectProgress,
} from "../utils/projectProgress"
import { toast } from "sonner"

const STORAGE_KEY_PROJECTS = "worktrack_projects"

interface ProjectContextValue {
  projects: Project[]
  getProject: (id: string) => Project | undefined
  createProject: (input: CreateProjectInput) => Project
  updateProject: (id: string, updates: Partial<Project>) => { success: boolean; error?: string }
  archiveProject: (id: string) => { success: boolean; error?: string }
  deleteProject: (id: string) => { success: boolean; error?: string }
  
  // Project Parts management
  addProjectPart: (input: CreateProjectPartInput) => { success: boolean; error?: string }
  updateProjectPart: (
    projectId: string,
    partId: string,
    updates: Partial<ProjectPart>
  ) => { success: boolean; error?: string }
  deleteProjectPart: (projectId: string, partId: string) => { success: boolean; error?: string }

  // Project Links management
  addProjectLink: (projectId: string, link: Omit<ProjectLink, "id">) => void
  deleteProjectLink: (projectId: string, linkId: string) => void

  // Progress & Validation
  getProjectProgress: (project: Project) => number
  checkProjectWeights: (parts: ProjectPart[]) => { isValid: boolean; totalWeight: number; difference: number }

  // Synchronization with employee tasks
  syncTaskProgressToProject: (
    projectId: string,
    projectPartId: string,
    newProgress: number
  ) => void
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined)

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROJECTS)
      return stored ? JSON.parse(stored) : initialMockProjects
    } catch {
      return initialMockProjects
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects))
    } catch {}
  }, [projects])

  const getProject = useCallback(
    (id: string) => {
      return projects.find(p => p.id === id || p.code === id)
    },
    [projects]
  )

  const getProjectProgress = useCallback((project: Project) => {
    return calculateOverallProjectProgress(project.parts)
  }, [])

  const checkProjectWeights = useCallback((parts: ProjectPart[]) => {
    return validateProjectWeights(parts)
  }, [])

  const createProject = useCallback(
    (input: CreateProjectInput) => {
      const newId = `PRJ-${Math.floor(100 + Math.random() * 900)}`
      const nowIso = new Date().toISOString()

      const newProject: Project = {
        id: newId,
        name: input.name,
        code: input.code.toUpperCase(),
        clientName: input.clientName,
        description: input.description,
        status: input.status || "planning",
        priority: input.priority || "medium",
        startDate: input.startDate,
        deadline: input.deadline,
        projectOwnerId: input.projectOwnerId,
        projectOwnerName: input.projectOwnerName,
        assignedDepartmentIds: input.assignedDepartmentIds,
        assignedEmployeeIds: input.assignedEmployeeIds,
        parts: [],
        links: (input.links || []).map((lnk, idx) => ({
          ...lnk,
          id: `lnk-${Date.now()}-${idx}`,
        })),
        activities: [
          {
            id: `act-${Date.now()}`,
            projectId: newId,
            action: "Project Created",
            description: `Project provisioned by ${input.projectOwnerName}.`,
            performedBy: input.projectOwnerName,
            timestamp: nowIso,
          },
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
      }

      setProjects(prev => [newProject, ...prev])
      toast.success(`Project "${input.name}" (${input.code}) created successfully.`)
      return newProject
    },
    []
  )

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) => {
      let success = false
      setProjects(prev =>
        prev.map(p => {
          if (p.id === id) {
            success = true
            const nowIso = new Date().toISOString()
            const updatedActivities: ProjectActivity[] = [
              {
                id: `act-${Date.now()}`,
                projectId: id,
                action: "Project Updated",
                description: `Project parameters updated.`,
                performedBy: "Admin",
                timestamp: nowIso,
              },
              ...p.activities,
            ]
            return {
              ...p,
              ...updates,
              activities: updatedActivities,
              updatedAt: nowIso,
            }
          }
          return p
        })
      )
      if (success) {
        toast.success("Project updated successfully.")
        return { success: true }
      }
      return { success: false, error: "Project not found" }
    },
    []
  )

  const archiveProject = useCallback((id: string) => {
    let success = false
    setProjects(prev =>
      prev.map(p => {
        if (p.id === id) {
          success = true
          return {
            ...p,
            status: "archived",
            updatedAt: new Date().toISOString(),
          }
        }
        return p
      })
    )
    if (success) {
      toast.success("Project archived.")
      return { success: true }
    }
    return { success: false, error: "Project not found" }
  }, [])

  const deleteProject = useCallback((id: string) => {
    let success = false
    setProjects(prev => {
      const exists = prev.some(p => p.id === id)
      if (exists) {
        success = true
        return prev.filter(p => p.id !== id)
      }
      return prev
    })
    if (success) {
      toast.success("Project deleted successfully.")
      return { success: true }
    }
    return { success: false, error: "Project not found" }
  }, [])

  const addProjectPart = useCallback((input: CreateProjectPartInput) => {
    let success = false
    setProjects(prev =>
      prev.map(p => {
        if (p.id === input.projectId) {
          success = true
          const newPartId = `PRT-${p.id.replace("PRJ-", "")}-${p.parts.length + 1}`
          const newPart: ProjectPart = {
            id: newPartId,
            projectId: input.projectId,
            name: input.name,
            description: input.description,
            weight: Number(input.weight) || 0,
            assignedDepartmentId: input.assignedDepartmentId,
            assignedEmployeeIds: input.assignedEmployeeIds,
            startDate: input.startDate,
            deadline: input.deadline,
            progress: 0,
            status: "planning",
            notes: input.notes,
            order: p.parts.length + 1,
          }

          const updatedParts = [...p.parts, newPart]
          const nowIso = new Date().toISOString()
          const activity: ProjectActivity = {
            id: `act-${Date.now()}`,
            projectId: p.id,
            action: "Part Added",
            description: `Work package "${input.name}" added with ${input.weight}% weight.`,
            performedBy: "Admin",
            timestamp: nowIso,
          }

          return {
            ...p,
            parts: updatedParts,
            activities: [activity, ...p.activities],
            updatedAt: nowIso,
          }
        }
        return p
      })
    )

    if (success) {
      toast.success(`Project part "${input.name}" added.`)
      return { success: true }
    }
    return { success: false, error: "Project not found" }
  }, [])

  const updateProjectPart = useCallback(
    (projectId: string, partId: string, updates: Partial<ProjectPart>) => {
      let success = false
      setProjects(prev =>
        prev.map(p => {
          if (p.id === projectId) {
            success = true
            const updatedParts = p.parts.map(part => {
              if (part.id === partId) {
                const newProgress = updates.progress !== undefined ? updates.progress : part.progress
                let newStatus = updates.status || part.status
                if (newProgress === 100) newStatus = "completed"
                else if (newProgress > 0 && newStatus === "planning") newStatus = "in-progress"

                return {
                  ...part,
                  ...updates,
                  progress: newProgress,
                  status: newStatus,
                }
              }
              return part
            })

            const nowIso = new Date().toISOString()
            const activity: ProjectActivity = {
              id: `act-${Date.now()}`,
              projectId,
              action: "Part Updated",
              description: `Work package parameters updated.`,
              performedBy: "Admin",
              timestamp: nowIso,
            }

            return {
              ...p,
              parts: updatedParts,
              activities: [activity, ...p.activities],
              updatedAt: nowIso,
            }
          }
          return p
        })
      )
      if (success) {
        toast.success("Project part updated.")
        return { success: true }
      }
      return { success: false, error: "Part not found" }
    },
    []
  )

  const deleteProjectPart = useCallback((projectId: string, partId: string) => {
    let success = false
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          success = true
          const updatedParts = p.parts.filter(part => part.id !== partId)
          const nowIso = new Date().toISOString()
          return {
            ...p,
            parts: updatedParts,
            activities: [
              {
                id: `act-${Date.now()}`,
                projectId,
                action: "Part Removed",
                description: `Work package removed from project.`,
                performedBy: "Admin",
                timestamp: nowIso,
              },
              ...p.activities,
            ],
            updatedAt: nowIso,
          }
        }
        return p
      })
    )
    if (success) {
      toast.success("Project part removed.")
      return { success: true }
    }
    return { success: false, error: "Project not found" }
  }, [])

  const addProjectLink = useCallback((projectId: string, link: Omit<ProjectLink, "id">) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          const newLink: ProjectLink = {
            ...link,
            id: `lnk-${Date.now()}`,
          }
          return {
            ...p,
            links: [...p.links, newLink],
            updatedAt: new Date().toISOString(),
          }
        }
        return p
      })
    )
    toast.success("Project link added.")
  }, [])

  const deleteProjectLink = useCallback((projectId: string, linkId: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            links: p.links.filter(l => l.id !== linkId),
            updatedAt: new Date().toISOString(),
          }
        }
        return p
      })
    )
    toast.success("Project link removed.")
  }, [])

  const syncTaskProgressToProject = useCallback(
    (projectId: string, projectPartId: string, newProgress: number) => {
      setProjects(prev =>
        prev.map(p => {
          if (p.id === projectId) {
            const updatedParts = p.parts.map(part => {
              if (part.id === projectPartId) {
                let status = part.status
                if (newProgress === 100) status = "completed"
                else if (newProgress > 0 && status === "planning") status = "in-progress"

                return {
                  ...part,
                  progress: newProgress,
                  status,
                }
              }
              return part
            })

            const nowIso = new Date().toISOString()
            const activity: ProjectActivity = {
              id: `act-${Date.now()}`,
              projectId,
              action: "Progress Synced",
              description: `Assignment progress updated to ${newProgress}%.`,
              performedBy: "Employee Work Record",
              timestamp: nowIso,
            }

            return {
              ...p,
              parts: updatedParts,
              activities: [activity, ...p.activities],
              updatedAt: nowIso,
            }
          }
          return p
        })
      )
    },
    []
  )

  const value = useMemo(
    () => ({
      projects,
      getProject,
      createProject,
      updateProject,
      archiveProject,
      deleteProject,
      addProjectPart,
      updateProjectPart,
      deleteProjectPart,
      addProjectLink,
      deleteProjectLink,
      getProjectProgress,
      checkProjectWeights,
      syncTaskProgressToProject,
    }),
    [
      projects,
      getProject,
      createProject,
      updateProject,
      archiveProject,
      deleteProject,
      addProjectPart,
      updateProjectPart,
      deleteProjectPart,
      addProjectLink,
      deleteProjectLink,
      getProjectProgress,
      checkProjectWeights,
      syncTaskProgressToProject,
    ]
  )

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export const useProjects = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider")
  }
  return context
}

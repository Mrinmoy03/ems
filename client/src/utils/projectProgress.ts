import { ProjectPart } from "../types/project"

/**
 * Validates that the sum of all project part contribution weights equals exactly 100%.
 */
export function validateProjectWeights(parts: ProjectPart[]): {
  isValid: boolean
  totalWeight: number
  difference: number
} {
  const totalWeight = parts.reduce((sum, part) => sum + (Number(part.weight) || 0), 0)
  const difference = 100 - totalWeight
  // Allow a tiny floating point epsilon
  const isValid = Math.abs(difference) < 0.01

  return {
    isValid,
    totalWeight: Math.round(totalWeight * 100) / 100,
    difference: Math.round(difference * 100) / 100,
  }
}

/**
 * Calculates the progress of a specific project part from its underlying tasks/assignments.
 * If linked tasks exist, part progress is derived from the average of task progress values.
 * If no linked tasks exist, it falls back to the part's own assigned progress.
 */
export function calculateProjectPartProgress(
  part: ProjectPart,
  linkedTasks: { progress: number }[] = []
): number {
  if (linkedTasks.length > 0) {
    const sum = linkedTasks.reduce((acc, t) => acc + (Number(t.progress) || 0), 0)
    return Math.round(sum / linkedTasks.length)
  }
  return Math.min(100, Math.max(0, Math.round(part.progress || 0)))
}

/**
 * Calculates overall project progress using the weighted formula:
 * Overall Project Progress = Σ (Part Weight × Part Progress) / 100
 */
export function calculateOverallProjectProgress(
  parts: ProjectPart[],
  tasksByPartId?: Record<string, { progress: number }[]>
): number {
  if (!parts || parts.length === 0) return 0

  let totalWeightedProgress = 0

  for (const part of parts) {
    const linkedTasks = tasksByPartId ? tasksByPartId[part.id] || [] : []
    const partProgress = calculateProjectPartProgress(part, linkedTasks)
    const weight = Number(part.weight) || 0
    totalWeightedProgress += (weight * partProgress) / 100
  }

  return Math.min(100, Math.max(0, Math.round(totalWeightedProgress * 10) / 10))
}

/**
 * Computes individual part contribution to the overall project (e.g., 40% weight * 50% progress = 20% contribution).
 */
export function getPartContribution(weight: number, progress: number): number {
  return Math.round(((Number(weight) || 0) * (Number(progress) || 0)) / 100 * 10) / 10
}


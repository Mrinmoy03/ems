import { Request, Response } from "express";
import pool from "../config/db";
import { createNotificationInternal } from "./notificationController";

const generateId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, status, projectId } = req.query;

    let query = `
      SELECT t.*,
             e.first_name, e.last_name, e.employee_id as emp_code,
             d.name as department_name,
             p.name as project_name
      FROM tasks t
      LEFT JOIN employees e ON t.assigned_to = e.id
      LEFT JOIN departments d ON t.department_id = d.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employeeId) {
      query += ` AND (t.assigned_to = ? OR e.employee_id = ? OR e.user_id = ?)`;
      params.push(employeeId, employeeId, employeeId);
    }
    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }
    if (projectId) {
      query += ` AND t.project_id = ?`;
      params.push(projectId);
    }

    query += ` ORDER BY t.deadline ASC, t.created_at DESC`;

    const [rows]: any = await pool.query(query, params);

    res.status(200).json({
      success: true,
      tasks: rows || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      assignedTo,
      departmentId,
      projectId,
      projectPartId,
      priority,
      deadline,
      createdBy,
    } = req.body;

    if (!title || !assignedTo || !deadline) {
      res.status(400).json({
        success: false,
        message: "Task title, assignee, and deadline are required.",
      });
      return;
    }

    // 1. Resolve assignees (can be array or string)
    const rawAssignees: string[] = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    if (rawAssignees.length === 0) {
      res.status(400).json({ success: false, message: "At least one assignee is required." });
      return;
    }

    // 2. Resolve department if provided
    let resolvedDeptId: string | null = null;
    if (departmentId) {
      const [deptRows]: any = await pool.query(
        "SELECT id FROM departments WHERE id = ? OR code = ? OR name = ?",
        [departmentId, departmentId, departmentId]
      );
      if (deptRows && deptRows.length > 0) {
        resolvedDeptId = deptRows[0].id;
      }
    }

    // 3. Resolve project if provided
    let resolvedProjectId: string | null = null;
    if (projectId) {
      const [projRows]: any = await pool.query(
        "SELECT id FROM projects WHERE id = ? OR project_code = ? OR name = ?",
        [projectId, projectId, projectId]
      );
      if (projRows && projRows.length > 0) {
        resolvedProjectId = projRows[0].id;
      }
    }

    const createdTaskIds: string[] = [];

    // 4. Create task entry for each assigned employee
    for (const rawAssignee of rawAssignees) {
      const [empRows]: any = await pool.query(
        `SELECT id, user_id, employee_id, first_name, last_name, department_id FROM employees 
         WHERE id = ? OR employee_id = ? OR user_id = ?`,
        [rawAssignee, rawAssignee, rawAssignee]
      );

      if (!empRows || empRows.length === 0) {
        console.warn(`Assignee ${rawAssignee} not found in employees table. Skipping.`);
        continue;
      }

      const resolvedEmp = empRows[0];
      const taskId = generateId("tsk");
      const deptToUse = resolvedDeptId || resolvedEmp.department_id || null;
      const deadlineDate = deadline ? new Date(deadline) : new Date();

      await pool.query(
        `INSERT INTO tasks (id, title, description, assigned_to, department_id, project_id, project_part_id, priority, status, progress, deadline, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
        [
          taskId,
          title.trim(),
          description || null,
          resolvedEmp.id,
          deptToUse,
          resolvedProjectId,
          projectPartId || null,
          priority || "medium",
          deadlineDate,
          createdBy || null,
        ]
      );

      createdTaskIds.push(taskId);

      // Notify assigned employee
      try {
        if (resolvedEmp.user_id) {
          await createNotificationInternal({
            userId: resolvedEmp.user_id,
            roleTarget: "employee",
            title: "New Task Assigned",
            message: `You have been assigned: "${title.trim()}". Deadline: ${deadline || "N/A"}.`,
            type: "task",
            entityId: taskId,
          });
        }
      } catch (err: any) {
        console.warn("Notice: could not dispatch task assignment notification:", err.message);
      }
    }

    if (createdTaskIds.length === 0) {
      res.status(404).json({ success: false, message: "No valid assignees found in organization." });
      return;
    }

    res.status(201).json({
      success: true,
      message: `Task created and assigned to ${createdTaskIds.length} employee(s).`,
      taskId: createdTaskIds[0],
      taskIds: createdTaskIds,
    });
  } catch (error: any) {
    console.error("Error in createTask:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTaskDeadline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { deadline, reason, changedBy } = req.body;

    if (!deadline || !reason) {
      res.status(400).json({
        success: false,
        message: "New deadline date and valid justification reason are required.",
      });
      return;
    }

    const deadlineDate = new Date(deadline);

    await pool.query(
      `UPDATE tasks
       SET deadline = ?, delay_reason = ?
       WHERE id = ?`,
      [deadlineDate, reason.trim(), id]
    );

    res.status(200).json({
      success: true,
      message: "Task deadline updated successfully.",
      deadline,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
    res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTaskProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { progress, delayReason } = req.body;

    if (progress === undefined || progress < 0 || progress > 100) {
      res.status(400).json({
        success: false,
        message: "Progress must be an integer between 0 and 100.",
      });
      return;
    }

    // Check task status derivation
    const [tasks]: any = await pool.query("SELECT * FROM tasks WHERE id = ?", [id]);
    if (!tasks || tasks.length === 0) {
      res.status(404).json({ success: false, message: "Task not found." });
      return;
    }

    const task = tasks[0];
    const today = new Date().toISOString().split("T")[0];
    const isOverdue = task.deadline < today && progress < 100;

    if (isOverdue && !delayReason && progress < 100) {
      res.status(400).json({
        success: false,
        message: "Mandatory delay explanation required for updating overdue deliverables.",
      });
      return;
    }

    let newStatus = "pending";
    if (progress === 100) {
      newStatus = "completed";
    } else if (isOverdue) {
      newStatus = "overdue";
    } else if (progress > 0) {
      newStatus = "in-progress";
    }

    await pool.query(
      `UPDATE tasks
       SET progress = ?, status = ?, delay_reason = COALESCE(?, delay_reason)
       WHERE id = ?`,
      [progress, newStatus, delayReason || null, id]
    );

    // Notify admins if completed or overdue delay reported
    try {
      if (progress === 100) {
        await createNotificationInternal({
          roleTarget: "admin",
          title: "Deliverable Completed",
          message: `Task "${task.title}" has reached 100% completion.`,
          type: "task",
          entityId: id,
        });
      } else if (delayReason) {
        await createNotificationInternal({
          roleTarget: "admin",
          title: "Deliverable Delay Notice",
          message: `Task "${task.title}" reported delay: ${delayReason}`,
          type: "task",
          entityId: id,
        });
      }
    } catch (err: any) {
      console.warn("Notice: could not dispatch task progress notification:", err.message);
    }

    res.status(200).json({
      success: true,
      message: "Task progress updated successfully.",
      status: newStatus,
      progress,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


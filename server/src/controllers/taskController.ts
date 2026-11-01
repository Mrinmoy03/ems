import { Request, Response } from "express";
import pool from "../config/db";

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
      query += ` AND (t.assigned_to = ? OR e.employee_id = ?)`;
      params.push(employeeId, employeeId);
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

    const taskId = generateId("tsk");

    await pool.query(
      `INSERT INTO tasks (id, title, description, assigned_to, department_id, project_id, project_part_id, priority, status, progress, deadline, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
      [
        taskId,
        title.trim(),
        description || null,
        assignedTo,
        departmentId || null,
        projectId || null,
        projectPartId || null,
        priority || "medium",
        deadline,
        createdBy || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Task created and assigned successfully.",
      taskId,
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


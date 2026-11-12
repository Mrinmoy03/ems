"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectPartProgress = exports.createProject = exports.getProjectById = exports.getAllProjects = void 0;
const db_1 = __importDefault(require("../config/db"));
const generateId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
const getAllProjects = async (_req, res) => {
    try {
        const [projects] = await db_1.default.query(`
      SELECT p.*, u.email as owner_email
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      ORDER BY p.created_at DESC
    `);
        // Fetch parts and assignees for each project
        for (const proj of projects) {
            const [parts] = await db_1.default.query(`SELECT pp.*, d.name as department_name
         FROM project_parts pp
         LEFT JOIN departments d ON pp.department_id = d.id
         WHERE pp.project_id = ?`, [proj.id]);
            for (const part of parts) {
                const [assignees] = await db_1.default.query(`SELECT e.id, e.employee_id, e.first_name, e.last_name, e.email, e.avatar_url
           FROM project_part_assignees ppa
           JOIN employees e ON ppa.employee_id = e.id
           WHERE ppa.part_id = ?`, [part.id]);
                part.assignees = assignees || [];
            }
            proj.parts = parts || [];
        }
        res.status(200).json({
            success: true,
            projects: projects || [],
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllProjects = getAllProjects;
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const [projects] = await db_1.default.query(`SELECT p.*, u.email as owner_email
       FROM projects p
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE p.id = ? OR p.project_code = ?`, [id, id]);
        if (!projects || projects.length === 0) {
            res.status(404).json({ success: false, message: "Project not found." });
            return;
        }
        const project = projects[0];
        const [parts] = await db_1.default.query(`SELECT pp.*, d.name as department_name
       FROM project_parts pp
       LEFT JOIN departments d ON pp.department_id = d.id
       WHERE pp.project_id = ?`, [project.id]);
        for (const part of parts) {
            const [assignees] = await db_1.default.query(`SELECT e.id, e.employee_id, e.first_name, e.last_name, e.email, e.avatar_url
         FROM project_part_assignees ppa
         JOIN employees e ON ppa.employee_id = e.id
         WHERE ppa.part_id = ?`, [part.id]);
            part.assignees = assignees || [];
        }
        project.parts = parts || [];
        res.status(200).json({
            success: true,
            project,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProjectById = getProjectById;
const createProject = async (req, res) => {
    try {
        const { projectCode, name, client, description, ownerId, status, priority, startDate, deadline, liveUrl, stagingUrl, repoUrl, figmaUrl, parts, } = req.body;
        if (!projectCode || !name || !startDate || !deadline) {
            res.status(400).json({
                success: false,
                message: "Project code, name, start date, and deadline are required.",
            });
            return;
        }
        const projectId = generateId("prj");
        await db_1.default.query(`INSERT INTO projects (id, project_code, name, client, description, owner_id, status, priority, start_date, deadline, live_url, staging_url, repo_url, figma_url, overall_progress)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.00)`, [
            projectId,
            projectCode.trim().toUpperCase(),
            name.trim(),
            client || null,
            description || null,
            ownerId || null,
            status || "planning",
            priority || "medium",
            startDate,
            deadline,
            liveUrl || null,
            stagingUrl || null,
            repoUrl || null,
            figmaUrl || null,
        ]);
        if (Array.isArray(parts) && parts.length > 0) {
            for (const part of parts) {
                if (!part.name)
                    continue;
                const partId = generateId("part");
                await db_1.default.query(`INSERT INTO project_parts (id, project_id, name, description, weight, department_id, deadline, progress, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0.00, 'planning')`, [
                    partId,
                    projectId,
                    part.name.trim(),
                    part.description || null,
                    Number(part.weight) || 0,
                    part.departmentId || null,
                    part.deadline || deadline,
                ]);
            }
        }
        res.status(201).json({
            success: true,
            message: "Project created successfully.",
            projectId,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createProject = createProject;
const updateProjectPartProgress = async (req, res) => {
    try {
        const { partId } = req.params;
        const { progress, status } = req.body;
        const [partRows] = await db_1.default.query("SELECT project_id, weight FROM project_parts WHERE id = ?", [partId]);
        if (!partRows || partRows.length === 0) {
            res.status(404).json({ success: false, message: "Project part not found." });
            return;
        }
        const projectId = partRows[0].project_id;
        await db_1.default.query("UPDATE project_parts SET progress = ?, status = COALESCE(?, status) WHERE id = ?", [progress, status || null, partId]);
        // Recalculate Overall Project Progress: Σ(Part Weight × Part Progress) / 100
        const [allParts] = await db_1.default.query("SELECT weight, progress FROM project_parts WHERE project_id = ?", [projectId]);
        let calculatedOverall = 0;
        if (allParts && allParts.length > 0) {
            calculatedOverall = allParts.reduce((sum, p) => {
                return sum + (Number(p.weight) * Number(p.progress)) / 100;
            }, 0);
        }
        await db_1.default.query("UPDATE projects SET overall_progress = ? WHERE id = ?", [calculatedOverall.toFixed(2), projectId]);
        res.status(200).json({
            success: true,
            message: "Project part progress updated and overall progress recalculated.",
            overallProgress: calculatedOverall,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateProjectPartProgress = updateProjectPartProgress;

-- WorkTrack Enterprise Management System
-- Database Schema (MySQL 8.0+)

CREATE DATABASE IF NOT EXISTS `worktrack_ems` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `worktrack_ems`;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `description` TEXT,
  `color` VARCHAR(20) DEFAULT '#3b82f6',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Users Table (Core Auth for Admin, Super Admin, and Employees)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('employee', 'admin', 'super-admin') NOT NULL DEFAULT 'employee',
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB;

-- 3. Employees Table (Profile details linked to user account)
CREATE TABLE IF NOT EXISTS `employees` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL UNIQUE,
  `employee_id` VARCHAR(30) NOT NULL UNIQUE,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(30),
  `designation` VARCHAR(100) NOT NULL,
  `department_id` VARCHAR(36),
  `location` VARCHAR(100) DEFAULT 'Main HQ',
  `avatar_url` MEDIUMTEXT,
  `join_date` DATE NOT NULL,
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  INDEX `idx_emp_status` (`status`)
) ENGINE=InnoDB;

-- 4. Projects Table
CREATE TABLE IF NOT EXISTS `projects` (
  `id` VARCHAR(36) PRIMARY KEY,
  `project_code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `client` VARCHAR(100),
  `description` TEXT,
  `owner_id` VARCHAR(36),
  `status` ENUM('planning', 'in-progress', 'on-hold', 'completed', 'archived') NOT NULL DEFAULT 'planning',
  `priority` ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
  `start_date` DATE NOT NULL,
  `deadline` DATE NOT NULL,
  `live_url` VARCHAR(255),
  `staging_url` VARCHAR(255),
  `repo_url` VARCHAR(255),
  `figma_url` VARCHAR(255),
  `overall_progress` DECIMAL(5,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Project Parts / Work Packages (Weighted Progress Contribution)
CREATE TABLE IF NOT EXISTS `project_parts` (
  `id` VARCHAR(36) PRIMARY KEY,
  `project_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `weight` DECIMAL(5,2) NOT NULL,
  `department_id` VARCHAR(36),
  `deadline` DATE NOT NULL,
  `progress` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('planning', 'in-progress', 'on-hold', 'completed') NOT NULL DEFAULT 'planning',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Project Part Assignees
CREATE TABLE IF NOT EXISTS `project_part_assignees` (
  `part_id` VARCHAR(36) NOT NULL,
  `employee_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`part_id`, `employee_id`),
  FOREIGN KEY (`part_id`) REFERENCES `project_parts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Tasks Table (NO allocatedTime or timeAllotted allowed)
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` VARCHAR(36) PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `assigned_to` VARCHAR(36) NOT NULL,
  `department_id` VARCHAR(36),
  `project_id` VARCHAR(36),
  `project_part_id` VARCHAR(36),
  `priority` ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
  `status` ENUM('pending', 'in-progress', 'completed', 'overdue') NOT NULL DEFAULT 'pending',
  `progress` INT NOT NULL DEFAULT 0,
  `deadline` DATE NOT NULL,
  `delay_reason` TEXT,
  `created_by` VARCHAR(36),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`assigned_to`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`project_part_id`) REFERENCES `project_parts`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. Attendance & Shift Tracking
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` VARCHAR(36) PRIMARY KEY,
  `employee_id` VARCHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `punch_in` TIMESTAMP NULL,
  `punch_out` TIMESTAMP NULL,
  `total_duration_seconds` INT DEFAULT 0,
  `lunch_break_seconds` INT DEFAULT 0,
  `tea_break_seconds` INT DEFAULT 0,
  `status` ENUM('present', 'absent', 'half-day', 'on-leave') NOT NULL DEFAULT 'present',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_emp_date` (`employee_id`, `date`),
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Attendance Breaks (Lunch, Tea)
CREATE TABLE IF NOT EXISTS `attendance_breaks` (
  `id` VARCHAR(36) PRIMARY KEY,
  `attendance_id` VARCHAR(36) NOT NULL,
  `break_type` ENUM('lunch', 'tea', 'other') NOT NULL,
  `start_time` TIMESTAMP NOT NULL,
  `end_time` TIMESTAMP NULL,
  `duration_seconds` INT DEFAULT 0,
  FOREIGN KEY (`attendance_id`) REFERENCES `attendance`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Leave Requests (Exclusive Super Admin Approve/Reject authority)
CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` VARCHAR(36) PRIMARY KEY,
  `employee_id` VARCHAR(36) NOT NULL,
  `leave_type` ENUM('casual', 'sick', 'annual', 'unpaid', 'maternity', 'paternity') NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `admin_remarks` TEXT,
  `super_admin_remarks` TEXT,
  `decision_by` VARCHAR(36),
  `decision_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`decision_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 11. End-Of-Day (EOD) Reports
CREATE TABLE IF NOT EXISTS `eod_reports` (
  `id` VARCHAR(36) PRIMARY KEY,
  `employee_id` VARCHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `summary` TEXT NOT NULL,
  `tasks_completed` TEXT,
  `challenges` TEXT,
  `next_day_plan` TEXT,
  `hours_worked` DECIMAL(4,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Comments / Feedback
CREATE TABLE IF NOT EXISTS `comments` (
  `id` VARCHAR(36) PRIMARY KEY,
  `entity_type` ENUM('task', 'leave', 'report', 'project') NOT NULL,
  `entity_id` VARCHAR(36) NOT NULL,
  `author_id` VARCHAR(36) NOT NULL,
  `author_role` ENUM('employee', 'admin', 'super-admin') NOT NULL,
  `author_name` VARCHAR(100) NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 13. Notifications Table (Multi-role & targeted workforce alerts)
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NULL,
  `role_target` ENUM('all', 'admin', 'super-admin', 'employee') NOT NULL DEFAULT 'all',
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('task', 'leave', 'attendance', 'report', 'system') NOT NULL DEFAULT 'system',
  `entity_id` VARCHAR(36) NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notif_user` (`user_id`),
  INDEX `idx_notif_role` (`role_target`),
  INDEX `idx_notif_read` (`is_read`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { AdminEmployee, CreateEmployeeInput, EmployeeAccountStatus } from "../types/admin"
import { useAdmin } from "../context/AdminContext"
import { useAuth } from "../../auth/context/AuthContext"
import { api } from "../../services/api"
import {
  KeyRound,
  CheckCircle2,
  UserPlus,
  Edit3,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react"
import { toast } from "sonner"

interface EmployeeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeToEdit?: AdminEmployee | null
  onSuccess?: (employee: AdminEmployee) => void
}

export const EmployeeFormDialog: React.FC<EmployeeFormDialogProps> = ({
  open,
  onOpenChange,
  employeeToEdit,
  onSuccess,
}) => {
  const { employees, departments, createEmployee, updateEmployee, updateEmployeePassword } = useAdmin()
  const { registerProvisionedEmployee } = useAuth()

  const isEdit = Boolean(employeeToEdit)

  // Form Fields
  const [employeeId, setEmployeeId] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [designation, setDesignation] = useState("")
  const [department, setDepartment] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [accountStatus, setAccountStatus] = useState<EmployeeAccountStatus>("active")

  // Provisioning feedback state
  const [provisionedNotice, setProvisionedNotice] = useState<{
    email: string
    tempPassword?: string
    id: string
  } | null>(null)

  const [copiedCredentials, setCopiedCredentials] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Helper to generate an available unique Login ID
  const generateNewLoginId = () => {
    let candidate = `EMP-${Math.floor(1000 + Math.random() * 9000)}`
    while (employees.some(e => e.id === candidate)) {
      candidate = `EMP-${Math.floor(1000 + Math.random() * 9000)}`
    }
    return candidate
  }

  // Helper to generate a strong password
  const generateNewPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*"
    let generated = "WT#"
    for (let i = 0; i < 7; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    generated += "!"
    return generated
  }

  useEffect(() => {
    if (employeeToEdit) {
      const parts = employeeToEdit.name.split(" ")
      setEmployeeId(employeeToEdit.id)
      setFirstName(parts[0] || "")
      setLastName(parts.slice(1).join(" ") || "")
      setEmail(employeeToEdit.email || "")
      setPassword("")
      setConfirmPassword("")
      setShowPassword(false)
      setShowConfirmPassword(false)
      setDesignation(employeeToEdit.designation || "")
      setDepartment(employeeToEdit.department || departments[0]?.name || "")
      setPhone(employeeToEdit.phone || "")
      setLocation(employeeToEdit.location || "Remote")
      setAccountStatus(employeeToEdit.accountStatus || "active")
      setProvisionedNotice(null)
    } else {
      setEmployeeId(generateNewLoginId())
      setFirstName("")
      setLastName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setShowPassword(false)
      setShowConfirmPassword(false)
      setDesignation("")
      setDepartment(departments[0]?.name || "Product Engineering")
      setPhone("")
      setLocation("San Francisco, CA (HQ)")
      setAccountStatus("active")
      setProvisionedNotice(null)
    }
    setErrors({})
    setCopiedCredentials(false)
  }, [employeeToEdit, open, departments])

  const validate = () => {
    const errs: Record<string, string> = {}

    if (!isEdit) {
      if (!employeeId.trim()) {
        errs.employeeId = "Login ID / Employee ID is required"
      } else if (
        employees.some(
          e => e.id.toLowerCase() === employeeId.trim().toLowerCase()
        )
      ) {
        errs.employeeId = `Login ID "${employeeId.trim().toUpperCase()}" is already assigned to another employee`
      }

      if (!password) {
        errs.password = "Password is required"
      } else if (password.length < 6) {
        errs.password = "Password must be at least 6 characters"
      }

      if (!confirmPassword) {
        errs.confirmPassword = "Confirm password is required"
      } else if (password !== confirmPassword) {
        errs.confirmPassword = "Passwords do not match"
      }
    } else {
      // isEdit mode: password is optional, but if entered must be >= 6 and match confirmPassword
      if (password) {
        if (password.length < 6) {
          errs.password = "New password must be at least 6 characters"
        }
        if (!confirmPassword) {
          errs.confirmPassword = "Confirm password is required"
        } else if (password !== confirmPassword) {
          errs.confirmPassword = "Passwords do not match"
        }
      }
    }

    if (!firstName.trim()) errs.firstName = "First name is required"
    if (!lastName.trim()) errs.lastName = "Last name is required"
    if (!email.trim()) {
      errs.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Valid email is required"
    }
    if (!designation.trim()) errs.designation = "Designation/Role is required"
    if (!department) errs.department = "Department is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    if (isEdit && employeeToEdit) {
      updateEmployee(employeeToEdit.id, {
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        designation: designation.trim(),
        department,
        phone: phone.trim(),
        location: location.trim(),
        accountStatus,
      })

      // If admin updated the password during edit profile
      if (password.trim()) {
        updateEmployeePassword(employeeToEdit.id, password.trim())
      }

      onOpenChange(false)
    } else {
      const input: CreateEmployeeInput = {
        employeeId: employeeId.trim().toUpperCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password.trim(),
        designation: designation.trim(),
        department,
        phone: phone.trim() || "+1 (555) 000-0000",
        location: location.trim() || "Remote",
        accountStatus,
      }
      const created = createEmployee(input)

      // Sync with Auth Context & Backend API
      registerProvisionedEmployee({
        email: created.email,
        employeeId: created.id,
        password: password.trim(),
        name: `${created.firstName} ${created.lastName}`,
        department: created.department,
        designation: created.designation,
      })

      // Asynchronously post to backend API (resilient)
      api.employees.create({
        employeeId: created.id,
        firstName: created.firstName,
        lastName: created.lastName,
        email: created.email,
        password: password.trim(),
        designation: created.designation,
        departmentId: created.department,
        phone: created.phone,
        location: created.location,
        accountStatus: created.accountStatus || accountStatus,
      }).catch((err) => {
        console.warn("Backend API sync notice (offline mode fallback active):", err.message);
      })

      setProvisionedNotice({
        email: created.email,
        tempPassword: password.trim(),
        id: created.id,
      })
      if (onSuccess) onSuccess(created)
    }
  }

  const handleCopyAllCredentials = () => {
    if (!provisionedNotice) return
    const text = `WorkTrack Portal Login Credentials:\nEmployee ID / Login ID: ${provisionedNotice.id}\nEmail: ${provisionedNotice.email}\nPassword: ${provisionedNotice.tempPassword}\n\nNote: In compliance with corporate policy, only administrators can manage credentials.`
    navigator.clipboard.writeText(text)
    setCopiedCredentials(true)
    toast.success("Login ID, Email & Password copied to clipboard")
    setTimeout(() => setCopiedCredentials(false), 2500)
  }

  const handleClose = () => {
    setProvisionedNotice(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[620px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {isEdit ? (
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
            )}
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {isEdit ? `Edit Profile — ${employeeToEdit?.name}` : "Create Employee Account"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                {isEdit
                  ? "Update employee profile information, designation, department, and account password."
                  : "Set employee record, assign Login ID, and configure login password."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {provisionedNotice ? (
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Account Created & Login Credentials Configured</span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                The employee record has been added. Login ID and Password were set exclusively by Admin. Employees cannot modify or reset their login credentials.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Employee Login ID:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  {provisionedNotice.id}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Login Email:</span>
                <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                  {provisionedNotice.email}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  Admin-Set Password:
                </span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  {provisionedNotice.tempPassword}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyAllCredentials}
                className="w-1/2 text-xs flex items-center gap-1.5 border-slate-300 dark:border-slate-700"
              >
                {copiedCredentials ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Credentials</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
              >
                Done & Return to Roster
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Security Banner */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                <strong>Admin Authority:</strong> Only administrators can assign Login IDs and set or update passwords. Employees cannot modify their login credentials.
              </p>
            </div>

            {/* Login ID Section */}
            <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="employeeId" className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                  Employee Login ID <span className="text-rose-500">*</span>
                </Label>
                {!isEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEmployeeId(generateNewLoginId())}
                    className="h-6 px-2 text-[11px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 gap-1 font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Auto-Generate ID
                  </Button>
                )}
              </div>

              {isEdit ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                    {employeeId}
                  </span>
                  <Badge variant="outline" className="text-[10px] text-slate-500 gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked (Permanent ID)
                  </Badge>
                </div>
              ) : (
                <div>
                  <Input
                    id="employeeId"
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value.toUpperCase())}
                    placeholder="e.g. EMP-1050"
                    className={`font-mono text-xs uppercase bg-white dark:bg-slate-900 ${
                      errors.employeeId ? "border-rose-500" : ""
                    }`}
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Unique corporate login identifier set by Admin.
                  </p>
                  {errors.employeeId && (
                    <p className="text-xs text-rose-500 mt-0.5">{errors.employeeId}</p>
                  )}
                </div>
              )}
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold">
                  First Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="e.g. Alex"
                  className={errors.firstName ? "border-rose-500" : ""}
                />
                {errors.firstName && <p className="text-xs text-rose-500">{errors.firstName}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold">
                  Last Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="e.g. Morgan"
                  className={errors.lastName ? "border-rose-500" : ""}
                />
                {errors.lastName && <p className="text-xs text-rose-500">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                Work Email (Login Email) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex.morgan@worktrack.io"
                className={errors.email ? "border-rose-500" : ""}
              />
              {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
            </div>

            {/* Password Section */}
            {!isEdit ? (
              /* Create Mode: Set Password & Confirm Password */
              <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Set Login Password (Admin Only)
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const p = generateNewPassword()
                      setPassword(p)
                      setConfirmPassword(p)
                    }}
                    className="h-6 px-2 text-[11px] text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 gap-1 font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Auto-Generate
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-semibold">
                      Set Password <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password (min 6 chars)"
                        className={`pr-9 font-mono text-xs bg-white dark:bg-slate-900 ${
                          errors.password ? "border-rose-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[11px] text-rose-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                      Confirm Password <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className={`pr-9 font-mono text-xs bg-white dark:bg-slate-900 ${
                          errors.confirmPassword ? "border-rose-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[11px] text-rose-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Admin sets this initial password. Employees cannot change their password.
                </p>
              </div>
            ) : (
              /* Edit Mode: Directly Update Password Inside Edit Profile */
              <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Update Password (Admin Only)
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const p = generateNewPassword()
                      setPassword(p)
                      setConfirmPassword(p)
                    }}
                    className="h-6 px-2 text-[11px] text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 gap-1 font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Generate Strong
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="editPassword" className="text-xs font-semibold">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="editPassword"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Leave blank to keep unchanged"
                        className={`pr-9 font-mono text-xs bg-white dark:bg-slate-900 ${
                          errors.password ? "border-rose-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[11px] text-rose-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="editConfirmPassword" className="text-xs font-semibold">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="editConfirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className={`pr-9 font-mono text-xs bg-white dark:bg-slate-900 ${
                          errors.confirmPassword ? "border-rose-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[11px] text-rose-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Leave blank to keep current password. Only administrators are authorized to update workforce credentials.
                </p>
              </div>
            )}

            {/* Role & Department */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="designation" className="text-xs font-semibold">
                  Designation / Role <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="designation"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className={errors.designation ? "border-rose-500" : ""}
                />
                {errors.designation && <p className="text-xs text-rose-500">{errors.designation}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-xs font-semibold">
                  Department <span className="text-rose-500">*</span>
                </Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-xs text-rose-500">{errors.department}</p>}
              </div>
            </div>

            {/* Phone & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-semibold">
                  Work Location
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="San Francisco / Remote"
                />
              </div>
            </div>

            {/* Account Status */}
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-semibold">
                Account Status
              </Label>
              <Select
                value={accountStatus}
                onValueChange={val => setAccountStatus(val as EmployeeAccountStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Full System Access)</SelectItem>
                  <SelectItem value="inactive">Inactive (Temporary Pause)</SelectItem>
                  <SelectItem value="deactivated">Deactivated (Archived Access)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                {isEdit ? "Save Changes" : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

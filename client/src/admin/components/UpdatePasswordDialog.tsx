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
import { AdminEmployee } from "../types/admin"
import { useAdmin } from "../context/AdminContext"
import { useAuth } from "../../auth/context/AuthContext"
import { api } from "../../services/api"
import {
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw,
  Lock,
  Copy,
  Check,
} from "lucide-react"
import { toast } from "sonner"

interface UpdatePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: AdminEmployee | null
  onSuccess?: () => void
}

export const UpdatePasswordDialog: React.FC<UpdatePasswordDialogProps> = ({
  open,
  onOpenChange,
  employee,
  onSuccess,
}) => {
  const { updateEmployeePassword } = useAdmin()
  const { registerProvisionedEmployee } = useAuth()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setNewPassword("")
      setConfirmPassword("")
      setShowPassword(false)
      setCopied(false)
      setErrors({})
    }
  }, [open, employee])

  if (!employee) return null

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*"
    let generated = "WT#"
    for (let i = 0; i < 8; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    generated += "!"
    setNewPassword(generated)
    setConfirmPassword(generated)
    setShowPassword(true)
    setErrors({})
    toast.info("Strong secure password generated.")
  }

  const handleCopyPassword = () => {
    if (!newPassword) return
    navigator.clipboard.writeText(newPassword)
    setCopied(true)
    toast.success("Password copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!newPassword) {
      errs.newPassword = "New password is required"
    } else if (newPassword.length < 6) {
      errs.newPassword = "Password must be at least 6 characters"
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Confirm password is required"
    } else if (confirmPassword !== newPassword) {
      errs.confirmPassword = "Passwords do not match"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const res = updateEmployeePassword(employee.id, newPassword)
    if (res.success) {
      registerProvisionedEmployee({
        phone: employee.phone || employee.id,
        email: employee.email,
        employeeId: employee.id,
        password: newPassword.trim(),
        name: employee.name,
        department: employee.department,
        designation: employee.designation,
      })

      api.employees.updatePassword(employee.id, newPassword.trim()).catch((err) => {
        console.warn("Backend API sync notice (offline mode fallback active):", err.message)
      })

      if (onSuccess) onSuccess()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Update Employee Password
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set and provision a new login password for this employee account.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Employee identification card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {employee.name}
                </span>
                <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                  {employee.id}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                {employee.email} {employee.phone ? `• Login ID: ${employee.phone}` : ""}
              </p>
            </div>
          </div>

          <Badge className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
            {employee.department}
          </Badge>
        </div>

        {/* Security policy notice */}
        <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 text-xs flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-900 dark:text-amber-200 text-[11px]">
              Admin-Exclusive Credential Control
            </p>
            <p className="text-[10px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
              Employees cannot update their own password. Only administrators are authorized to set and modify workforce login credentials.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          {/* New Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="newPassword" className="text-xs font-semibold">
                New Password <span className="text-rose-500">*</span>
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGeneratePassword}
                className="h-6 px-2 text-[11px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                Generate Secure
              </Button>
            </div>

            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                className={`pr-20 font-mono text-xs ${errors.newPassword ? "border-rose-500" : ""}`}
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {newPassword && (
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    title="Copy password"
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-rose-500">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold">
              Confirm New Password <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password to confirm"
              className={`font-mono text-xs ${errors.confirmPassword ? "border-rose-500" : ""}`}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-rose-500">{errors.confirmPassword}</p>
            )}
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              Update Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


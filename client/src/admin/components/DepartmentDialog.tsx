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
import { Textarea } from "../../components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Department, CreateDepartmentInput } from "../types/admin"
import { useAdmin } from "../context/AdminContext"
import { Building2 } from "lucide-react"


interface DepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  departmentToEdit?: Department | null
}

export const DepartmentDialog: React.FC<DepartmentDialogProps> = ({
  open,
  onOpenChange,
  departmentToEdit,
}) => {
  const { employees, createDepartment, updateDepartment } = useAdmin()

  const isEdit = Boolean(departmentToEdit)

  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [headEmployeeId, setHeadEmployeeId] = useState<string>("none")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (departmentToEdit) {
      setName(departmentToEdit.name)
      setCode(departmentToEdit.code)
      setDescription(departmentToEdit.description)
      setHeadEmployeeId(departmentToEdit.headEmployeeId || "none")
    } else {
      setName("")
      setCode("")
      setDescription("")
      setHeadEmployeeId("none")
    }
    setError(null)
  }, [departmentToEdit, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Department name is required")
      return
    }
    if (!code.trim()) {
      setError("Department code is required")
      return
    }

    if (isEdit && departmentToEdit) {
      const selectedHead = headEmployeeId !== "none" ? employees.find(e => e.id === headEmployeeId) : undefined
      const res = updateDepartment(departmentToEdit.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        headEmployeeId: headEmployeeId !== "none" ? headEmployeeId : undefined,
        headEmployeeName: selectedHead ? selectedHead.name : undefined,
      })
      if (!res.success) {
        setError(res.error || "Failed to update department")
        return
      }
    } else {
      const input: CreateDepartmentInput = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        headEmployeeId: headEmployeeId !== "none" ? headEmployeeId : undefined,
      }
      const res = createDepartment(input)
      if (!res.success) {
        setError(res.error || "Failed to create department")
        return
      }
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {isEdit ? "Edit Department" : "Create New Department"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                {isEdit
                  ? "Update department hierarchy and assigned department lead."
                  : "Organize teams, assign operational leads, and manage group-level initiatives."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="deptName" className="text-xs font-semibold">
              Department Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="deptName"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Design System & UX"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deptCode" className="text-xs font-semibold">
              Department Code (Short) <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="deptCode"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="e.g. DSN or ENG"
              maxLength={8}
              className="uppercase font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deptHead" className="text-xs font-semibold">
              Department Head / Lead (Optional)
            </Label>
            <Select value={headEmployeeId} onValueChange={setHeadEmployeeId}>
              <SelectTrigger id="deptHead">
                <SelectValue placeholder="Select Department Head" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Head Designated</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} ({emp.designation})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deptDesc" className="text-xs font-semibold">
              Description / Responsibilities
            </Label>
            <Textarea
              id="deptDesc"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Primary functions, domain ownership, and group mandate..."
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isEdit ? "Save Department" : "Create Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

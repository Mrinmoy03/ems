import React from "react"
import { useNavigate } from "react-router-dom"
import { useEmployee } from "../context/EmployeeContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusCircle, ArrowLeft, Info } from "lucide-react"

const addTaskSchema = z.object({
  title: z.string().min(3, "Task title must be at least 3 characters").max(100),
  category: z.string().min(2, "Category is required"),
  deadline: z.string().min(1, "Deadline date and time are required"),
  description: z.string().optional(),
})

type AddTaskFormData = z.infer<typeof addTaskSchema>

export const AddTaskPage: React.FC = () => {
  const { addTask } = useEmployee()
  const navigate = useNavigate()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddTaskFormData>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      category: "Feature Work",
      deadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16),
      description: "",
    },
  })

  const onSubmit = (data: AddTaskFormData) => {
    addTask({
      title: data.title,
      category: data.category,
      deadline: new Date(data.deadline).toISOString(),
      description: data.description,
      isSelfCreated: true,
    })
    navigate("/employee/tasks")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Add Self-Directed Task
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log work that was not pre-assigned by an Admin
          </p>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <PlusCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Task Information
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Self-assigned tasks are tracked alongside admin assignments in daily reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Conduct peer code review on payment gateway PR"
                {...register("title")}
                className="text-xs"
              />
              {errors.title && (
                <p className="text-[11px] text-red-600 font-medium">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category *</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Feature Work">Feature Work</SelectItem>
                        <SelectItem value="Bug Fix">Bug Fix</SelectItem>
                        <SelectItem value="Architecture">Architecture</SelectItem>
                        <SelectItem value="Design System">Design System</SelectItem>
                        <SelectItem value="Code Review">Code Review</SelectItem>
                        <SelectItem value="Documentation">Documentation</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.category.message}</p>
                )}
              </div>

              {/* Deadline only - NO allocated duration */}
              <div className="space-y-1.5">
                <Label htmlFor="deadline">Target Deadline *</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  {...register("deadline")}
                  className="text-xs"
                />
                {errors.deadline && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.deadline.message}</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notice regarding deadlines</p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Tasks require an explicit deadline. Allocated duration is not tracked; if a task remains incomplete after its deadline, it will automatically register as overdue.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Scope & Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Key deliverables, testing steps, or context..."
                {...register("description")}
                className="text-xs min-h-[90px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

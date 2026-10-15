import React, { useState, useRef } from "react"
import { useEmployee } from "../context/EmployeeContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Camera,
  Mail,
  Building,
  MapPin,
  Phone,
  Calendar,
  ShieldCheck,
  User,
  UploadCloud,
  Link as LinkIcon,
  Sparkles,
  Check,
  AlertCircle,
} from "lucide-react"

export const ProfilePage: React.FC = () => {
  const { employee, updateEmployeeAvatar } = useEmployee()
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [newAvatarUrl, setNewAvatarUrl] = useState(employee.avatarUrl)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sampleAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  ]

  const handleOpenModal = () => {
    setNewAvatarUrl(employee.avatarUrl)
    setUploadedFileName(null)
    setFileError(null)
    setIsAvatarModalOpen(true)
  }

  const processFile = (file: File) => {
    setFileError(null)
    if (!file.type.startsWith("image/")) {
      setFileError("Please select a valid image file (PNG, JPG, WEBP, GIF)")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("Image size must be less than 5MB")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        setNewAvatarUrl(e.target.result)
        setUploadedFileName(file.name)
      }
    }
    reader.onerror = () => {
      setFileError("Failed to read image file. Please try again.")
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleSaveAvatar = () => {
    if (newAvatarUrl.trim()) {
      updateEmployeeAvatar(newAvatarUrl.trim())
      setIsAvatarModalOpen(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Employee Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personal identification, role assignments, and account settings
        </p>
      </div>

      {/* Main Profile Card */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 relative" />

        <CardContent className="p-6 relative pt-0">
          {/* Avatar with Camera badge */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-14 mb-6 gap-4">
            <div className="relative group">
              <Avatar className="h-28 w-28 ring-4 ring-white dark:ring-slate-900 shadow-md">
                <AvatarImage src={employee.avatarUrl} alt={employee.firstName} />
                <AvatarFallback className="text-xl font-bold">
                  {employee.firstName[0]}{employee.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleOpenModal}
                className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-transform active:scale-95 ring-2 ring-white dark:ring-slate-900"
                title="Change Profile Photo"
                aria-label="Change profile picture"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Change Photo Button - High visibility in both Light & Dark modes */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenModal}
              className="text-xs gap-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm font-medium"
            >
              <Camera className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Change Photo
            </Button>
          </div>

          {/* User Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {employee.firstName} {employee.lastName}
                </h2>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Active Employee
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {employee.designation} · {employee.department}
              </p>
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <Mail className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Email Address</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.email}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <Building className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Department</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.department}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Phone</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.phone}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Office Location</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.location}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Date Joined</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.joinDate}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <User className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Employee ID</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{employee.id}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Avatar Dialog with Device Upload */}
      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Update Profile Photo
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Upload an image from your device, select a curated avatar preset, or provide an image URL.
            </DialogDescription>
          </DialogHeader>

          {/* Live Preview Box */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 my-1">
            <Avatar className="h-16 w-16 ring-2 ring-blue-600/40 shrink-0">
              <AvatarImage src={newAvatarUrl} alt="Preview" />
              <AvatarFallback className="font-bold text-lg">
                {employee.firstName[0]}{employee.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Photo Preview
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {uploadedFileName ? `Device file: ${uploadedFileName}` : "Active selection will update your profile"}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                <Check className="h-3 w-3" /> Ready to save
              </span>
            </div>
          </div>

          {/* Upload Method Tabs */}
          <Tabs defaultValue="device" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="device" className="text-xs gap-1.5">
                <UploadCloud className="h-3.5 w-3.5" />
                From Device
              </TabsTrigger>
              <TabsTrigger value="presets" className="text-xs gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Presets
              </TabsTrigger>
              <TabsTrigger value="url" className="text-xs gap-1.5">
                <LinkIcon className="h-3.5 w-3.5" />
                Image URL
              </TabsTrigger>
            </TabsList>

            {/* 1. Device Upload Tab */}
            <TabsContent value="device" className="space-y-3 pt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                id="avatar-device-upload"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 scale-[1.01]"
                    : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-full">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Click to choose image or drag & drop
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Supports PNG, JPG, WEBP, or GIF (max 5MB)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 mt-1 border-slate-200 dark:border-slate-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                  >
                    Browse Local File
                  </Button>
                </div>
              </div>

              {fileError && (
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
            </TabsContent>

            {/* 2. Sample Presets Tab */}
            <TabsContent value="presets" className="space-y-3 pt-2">
              <Label className="text-xs text-slate-500 dark:text-slate-400">
                Choose a pre-configured professional profile photo:
              </Label>
              <div className="flex items-center gap-3 justify-center py-2 flex-wrap">
                {sampleAvatars.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setNewAvatarUrl(url)
                      setUploadedFileName(null)
                    }}
                    className={`rounded-full p-0.5 transition-all relative ${
                      newAvatarUrl === url
                        ? "ring-2 ring-blue-600 dark:ring-blue-400 scale-105"
                        : "opacity-70 hover:opacity-100 hover:scale-102"
                    }`}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={url} alt={`Option ${i + 1}`} />
                      <AvatarFallback>A{i + 1}</AvatarFallback>
                    </Avatar>
                    {newAvatarUrl === url && (
                      <span className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-0.5 shadow">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </TabsContent>

            {/* 3. Image URL Tab */}
            <TabsContent value="url" className="space-y-2 pt-2">
              <Label htmlFor="custom-url" className="text-xs">
                Direct Web Image URL
              </Label>
              <Input
                id="custom-url"
                value={newAvatarUrl.startsWith("data:") ? "" : newAvatarUrl}
                onChange={(e) => {
                  setNewAvatarUrl(e.target.value)
                  setUploadedFileName(null)
                }}
                placeholder="https://images.unsplash.com/..."
                className="text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Paste any publicly accessible image URL.
              </p>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAvatarModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveAvatar}
              disabled={!newAvatarUrl.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              Save Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

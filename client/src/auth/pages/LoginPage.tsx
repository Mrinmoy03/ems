import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ThemeToggle } from "../../components/ThemeToggle";
import {
  Lock,
  Phone,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  Clock,
  AlertCircle,
  FileCheck2,
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [emailOrId, setEmailOrId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailOrId.trim() || !password.trim()) {
      setErrorMessage("Please enter both your Phone Number / Email and password.");
      return;
    }

    const result = await login(emailOrId, password);
    if (result.success && result.role) {
      // Check if there was an intended target route
      const origin = (location.state as any)?.from?.pathname;
      if (origin && origin !== "/login") {
        navigate(origin, { replace: true });
        return;
      }

      // Default role landing portal
      if (result.role === "super-admin") {
        navigate("/super-admin", { replace: true });
      } else if (result.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/employee", { replace: true });
      }
    } else {
      setErrorMessage(result.error || "Authentication failed. Please verify credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-[#0b132b]/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-500/25">
            WT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base">WorkTrack</span>
              <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400">Operations & Workforce Management Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 border border-slate-800 rounded-lg px-3 py-1.5 bg-slate-900/60">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Mon–Sat 48h Governance</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md">
          {/* Card Frame */}
          <div className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 p-6 sm:p-8 backdrop-blur-xl">
            {/* Title Section */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Sign In to WorkTrack</h1>
              <p className="text-xs text-slate-400 mt-1.5">
                Unified corporate access for Workforce, Administration & Super Admin
              </p>
            </div>

            {/* Error Feedback */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone / Email Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-identity" className="text-xs font-semibold text-slate-200">
                    Phone Number (Employee Login ID) / Admin Email
                  </Label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4 text-blue-400" />
                  </div>
                  <Input
                    id="login-identity"
                    type="text"
                    placeholder="e.g. 9876543210 or admin@vamastudio.com"
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    className="pl-10 bg-slate-900/90 border-slate-700/80 focus:border-blue-500 text-white placeholder:text-slate-500 rounded-xl text-sm"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Employees log in using their registered <strong>Phone Number</strong>. Admins use corporate email.
                </p>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-xs font-medium text-slate-300">
                    Password
                  </Label>
                  <span className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer">
                    Contact Admin if forgotten
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-900/90 border-slate-700/80 focus:border-blue-500 text-white placeholder:text-slate-500 rounded-xl text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating Session...
                  </span>
                ) : (
                  <>
                    <span>Authenticate & Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Provisioning Notice */}
            <div className="mt-5 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2 leading-relaxed">
              <FileCheck2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>Employee Credential Policy:</strong> Admin creates employee profiles in the Admin Panel. The employee's <strong>Phone Number</strong> serves as their corporate Login ID, with password set by Admin.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0b132b]/80 px-6 py-3 text-center text-xs text-slate-500">
        WorkTrack EMS &copy; 2026 Vama Studio. Enterprise Role-Based Access Control System.
      </footer>
    </div>
  );
};

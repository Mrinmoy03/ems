import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import { toast } from "sonner";

export type UserRole = "super-admin" | "admin" | "employee";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  department?: string;
  designation?: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrId: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  logout: () => void;
  registerProvisionedEmployee: (emp: { email: string; employeeId: string; password: string; name: string; department?: string; designation?: string }) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY_USER = "worktrack_user";
const STORAGE_KEY_TOKEN = "worktrack_token";
const STORAGE_KEY_PROVISIONED = "worktrack_provisioned_employees";

// Standard preset credentials specified by the user
export const PRESET_CREDENTIALS = {
  superAdmin: {
    email: "superadmin@vamastudio.com",
    password: "SuperAdmin@2026!",
    role: "super-admin" as UserRole,
    name: "Platform Super Admin",
    employeeId: "SA-001",
    designation: "Executive Platform Director",
  },
  admin: {
    email: "admin@vamastudio.com",
    password: "Admin@2026!",
    role: "admin" as UserRole,
    name: "Operations Admin",
    employeeId: "ADM-001",
    designation: "Head of Operations",
  },
  defaultEmployee: {
    email: "alex.m@vamastudio.com",
    password: "Employee@2026!",
    role: "employee" as UserRole,
    name: "Alex Morgan",
    employeeId: "VAMA-001",
    department: "Engineering",
    designation: "Senior Frontend Engineer",
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_TOKEN) || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state changes with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  }, [token]);

  // Method to record employee credentials provisioned by Admin
  const registerProvisionedEmployee = useCallback(
    (emp: { email: string; employeeId: string; password: string; name: string; department?: string; designation?: string }) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_PROVISIONED);
        const list = stored ? JSON.parse(stored) : [];
        const filtered = list.filter((item: any) => item.email.toLowerCase() !== emp.email.toLowerCase() && item.employeeId.toUpperCase() !== emp.employeeId.toUpperCase());
        filtered.push(emp);
        localStorage.setItem(STORAGE_KEY_PROVISIONED, JSON.stringify(filtered));
      } catch (err) {
        console.error("Failed to store provisioned employee locally:", err);
      }
    },
    []
  );

  const login = useCallback(
    async (emailOrId: string, password: string): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
      setIsLoading(true);
      const cleanInput = emailOrId.trim().toLowerCase();
      const cleanPass = password.trim();

      try {
        // Attempt backend API call first
        const apiResponse = await api.auth.login({ emailOrId: cleanInput, password: cleanPass });
        if (apiResponse && apiResponse.success && apiResponse.user) {
          const authenticatedUser: UserProfile = {
            id: apiResponse.user.id || apiResponse.user.employeeId,
            name: apiResponse.user.name || apiResponse.user.email,
            email: apiResponse.user.email,
            role: apiResponse.user.role as UserRole,
            employeeId: apiResponse.user.employeeId,
            department: apiResponse.user.departmentName || apiResponse.user.department,
            designation: apiResponse.user.designation,
            avatarUrl: apiResponse.user.avatarUrl,
          };

          setUser(authenticatedUser);
          setToken(apiResponse.token);
          toast.success(`Welcome back, ${authenticatedUser.name}!`, {
            description: `Signed in to WorkTrack as ${authenticatedUser.role.toUpperCase()}.`,
          });
          setIsLoading(false);
          return { success: true, role: authenticatedUser.role };
        }
      } catch (apiError: any) {
        // If API fails due to network / DB offline, fallback to client credentials evaluation
        console.warn("Backend API login unreachable or returned error, evaluating client credentials...", apiError.message);
      }

      // Client-Side Resilient Credential Verification (Single Source of Truth)
      // 1. Super Admin Check
      if (
        (cleanInput === PRESET_CREDENTIALS.superAdmin.email.toLowerCase() ||
          cleanInput === PRESET_CREDENTIALS.superAdmin.employeeId.toLowerCase()) &&
        cleanPass === PRESET_CREDENTIALS.superAdmin.password
      ) {
        const superAdminProfile: UserProfile = {
          id: PRESET_CREDENTIALS.superAdmin.employeeId,
          name: PRESET_CREDENTIALS.superAdmin.name,
          email: PRESET_CREDENTIALS.superAdmin.email,
          role: "super-admin",
          employeeId: PRESET_CREDENTIALS.superAdmin.employeeId,
          designation: PRESET_CREDENTIALS.superAdmin.designation,
        };
        setUser(superAdminProfile);
        setToken("mock_jwt_superadmin_session_token");
        toast.success(`Welcome back, ${superAdminProfile.name}!`, {
          description: "Authenticated with Super Admin Executive privileges.",
        });
        setIsLoading(false);
        return { success: true, role: "super-admin" };
      }

      // 2. Admin Check
      if (
        (cleanInput === PRESET_CREDENTIALS.admin.email.toLowerCase() ||
          cleanInput === PRESET_CREDENTIALS.admin.employeeId.toLowerCase()) &&
        cleanPass === PRESET_CREDENTIALS.admin.password
      ) {
        const adminProfile: UserProfile = {
          id: PRESET_CREDENTIALS.admin.employeeId,
          name: PRESET_CREDENTIALS.admin.name,
          email: PRESET_CREDENTIALS.admin.email,
          role: "admin",
          employeeId: PRESET_CREDENTIALS.admin.employeeId,
          designation: PRESET_CREDENTIALS.admin.designation,
        };
        setUser(adminProfile);
        setToken("mock_jwt_admin_session_token");
        toast.success(`Welcome back, ${adminProfile.name}!`, {
          description: "Authenticated with System Administrator privileges.",
        });
        setIsLoading(false);
        return { success: true, role: "admin" };
      }

      // 3. Default Preset Employee Check
      if (
        (cleanInput === PRESET_CREDENTIALS.defaultEmployee.email.toLowerCase() ||
          cleanInput === PRESET_CREDENTIALS.defaultEmployee.employeeId.toLowerCase()) &&
        cleanPass === PRESET_CREDENTIALS.defaultEmployee.password
      ) {
        const empProfile: UserProfile = {
          id: PRESET_CREDENTIALS.defaultEmployee.employeeId,
          name: PRESET_CREDENTIALS.defaultEmployee.name,
          email: PRESET_CREDENTIALS.defaultEmployee.email,
          role: "employee",
          employeeId: PRESET_CREDENTIALS.defaultEmployee.employeeId,
          department: PRESET_CREDENTIALS.defaultEmployee.department,
          designation: PRESET_CREDENTIALS.defaultEmployee.designation,
        };
        setUser(empProfile);
        setToken("mock_jwt_employee_session_token");
        toast.success(`Welcome back, ${empProfile.name}!`, {
          description: "Authenticated to Employee Operations Portal.",
        });
        setIsLoading(false);
        return { success: true, role: "employee" };
      }

      // 4. Admin-Provisioned Employees in LocalStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY_PROVISIONED);
        if (stored) {
          const list = JSON.parse(stored);
          const found = list.find(
            (item: any) =>
              (item.email.toLowerCase() === cleanInput || item.employeeId.toLowerCase() === cleanInput) &&
              item.password === cleanPass
          );

          if (found) {
            const empProfile: UserProfile = {
              id: found.employeeId,
              name: found.name,
              email: found.email,
              role: "employee",
              employeeId: found.employeeId,
              department: found.department,
              designation: found.designation,
            };
            setUser(empProfile);
            setToken("mock_jwt_custom_employee_token");
            toast.success(`Welcome back, ${empProfile.name}!`, {
              description: "Authenticated using your Administrator-provisioned credentials.",
            });
            setIsLoading(false);
            return { success: true, role: "employee" };
          }
        }
      } catch (err) {
        console.error("Error reading provisioned employees:", err);
      }

      setIsLoading(false);
      const errorMsg = "Invalid credentials. Please verify your email/ID and password, or contact your Administrator.";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    try {
      api.auth.logout().catch(() => {});
    } catch {}
    toast.info("Logged out from WorkTrack Enterprise Management.");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        logout,
        registerProvisionedEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};


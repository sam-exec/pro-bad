"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export interface EmployeeInfo {
  employeeId: string;
  employeeName: string;
  role: "employee" | "admin";
}

export const DEFAULT_DEMO_EMPLOYEE: EmployeeInfo = {
  employeeId: "EMP001",
  employeeName: "Rahul Sharma",
  role: "employee",
};

export interface AuthContextType {
  employeeId: string;
  employeeName: string;
  role: "employee" | "admin";
  loginEmployee: (idInput?: string, nameInput?: string) => EmployeeInfo;
  logoutEmployee: () => void;
}

const STORAGE_KEY = "pro_badminton_employee_session";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<EmployeeInfo>(DEFAULT_DEMO_EMPLOYEE);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlEmpId = searchParams.get("employeeId") || searchParams.get("empId");

      if (urlEmpId) {
        const resolved: EmployeeInfo = {
          employeeId: urlEmpId.trim().toUpperCase(),
          employeeName: "Rahul Sharma",
          role: "employee",
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved));
        setSession(resolved);
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: EmployeeInfo = JSON.parse(stored);
        setSession({
          employeeId: parsed.employeeId || DEFAULT_DEMO_EMPLOYEE.employeeId,
          employeeName: parsed.employeeName || DEFAULT_DEMO_EMPLOYEE.employeeName,
          role: parsed.role || "employee",
        });
      }
    } catch {
      // Fallback silently
    }
  }, []);

  const loginEmployee = useCallback(
    (idInput?: string, nameInput?: string): EmployeeInfo => {
      const cleanId = idInput?.trim().toUpperCase() || DEFAULT_DEMO_EMPLOYEE.employeeId;
      const cleanName = nameInput?.trim() || "Rahul Sharma";
      const resolved: EmployeeInfo = {
        employeeId: cleanId,
        employeeName: cleanName,
        role: "employee",
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved));
      } catch {
        // Ignore storage errors
      }
      setSession(resolved);
      return resolved;
    },
    []
  );

  const logoutEmployee = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setSession(DEFAULT_DEMO_EMPLOYEE);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        employeeId: session.employeeId,
        employeeName: session.employeeName,
        role: session.role,
        loginEmployee,
        logoutEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}

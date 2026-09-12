"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  Branch,
  BRANCHES,
  DEFAULT_BRANCH,
  DEFAULT_DEMO_EMPLOYEE,
  EmployeeInfo,
  getBranchByCode,
  resolveEmployeeDetails,
} from "@/config/branches";
import { BranchRecordMeta } from "@/types/branch";

interface BranchContextType {
  currentBranch: Branch;
  employeeId: string;
  employeeName: string;
  allBranches: Branch[];
  loginEmployee: (idInput?: string, nameInput?: string) => EmployeeInfo;
  logoutEmployee: () => void;
  setBranch: (branch: Branch) => void;
  switchBranch: (branchCodeOrId: string) => void;
  getRecordAuditMeta: () => BranchRecordMeta;
}

const STORAGE_KEY = "pro_badminton_employee_session";

const BranchContext = createContext<BranchContextType | undefined>(undefined);

function getInitialSession(): EmployeeInfo {
  if (typeof window === "undefined") {
    return DEFAULT_DEMO_EMPLOYEE;
  }
  try {
    // 1. Check if URL has ?branch= or ?employeeId= for developer convenience
    const searchParams = new URLSearchParams(window.location.search);
    const urlEmpId = searchParams.get("employeeId") || searchParams.get("empId");
    const urlBranch = searchParams.get("branch");

    if (urlEmpId) {
      const resolved = resolveEmployeeDetails(urlEmpId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved));
      return resolved;
    }

    if (urlBranch) {
      const matched = getBranchByCode(urlBranch);
      if (matched) {
        const resolved: EmployeeInfo = {
          employeeId: matched.code === "MNK" ? "MNK001" : "NLG004",
          employeeName: matched.code === "MNK" ? "Vikram Reddy" : "Rahul Sharma",
          branch: matched,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved));
        return resolved;
      }
    }

    // 2. Read from localStorage if available
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: EmployeeInfo = JSON.parse(stored);
      const branchObj =
        BRANCHES.find(
          (b) => b.id === parsed.branch?.id || b.code === parsed.branch?.code
        ) || DEFAULT_BRANCH;
      return {
        employeeId: parsed.employeeId || DEFAULT_DEMO_EMPLOYEE.employeeId,
        employeeName: parsed.employeeName || DEFAULT_DEMO_EMPLOYEE.employeeName,
        branch: branchObj,
      };
    }
  } catch {
    // Fallback silently to default
  }
  return DEFAULT_DEMO_EMPLOYEE;
}

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<EmployeeInfo>(getInitialSession);

  /**
   * Development Mode Login Handler:
   * Determines branch from Employee ID prefix:
   * - Starts with "NLG" -> Nallagandla
   * - Starts with "MNK" -> Manikonda
   * - Empty / Unmatched -> Default Nallagandla Demo (Rahul Sharma - NLG004)
   */
  const loginEmployee = useCallback((idInput?: string, nameInput?: string): EmployeeInfo => {
    const resolved = resolveEmployeeDetails(idInput);
    if (nameInput && nameInput.trim()) {
      resolved.employeeName = nameInput.trim();
    }

    setSession(resolved);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved));
    } catch {
      // Ignore storage errors
    }
    return resolved;
  }, []);

  /**
   * Log out employee and reset to demo default
   */
  const logoutEmployee = useCallback(() => {
    setSession(DEFAULT_DEMO_EMPLOYEE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  /**
   * Manually switch branch
   */
  const setBranch = useCallback((branch: Branch) => {
    setSession((prev) => {
      const updated = { ...prev, branch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }, []);

  /**
   * Switch branch by code or id (e.g. "MNK" or "NLG")
   */
  const switchBranch = useCallback((branchCodeOrId: string) => {
    const branch = getBranchByCode(branchCodeOrId);
    if (branch) {
      const defaultForBranch = branch.code === "MNK" ? "MNK001" : "NLG004";
      const dummyName = branch.code === "MNK" ? "Vikram Reddy" : "Rahul Sharma";
      const updated: EmployeeInfo = {
        employeeId: defaultForBranch,
        employeeName: dummyName,
        branch,
      };
      setSession(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
    }
  }, []);

  /**
   * Helper that provides audit metadata automatically stamped to records in any module
   */
  const getRecordAuditMeta = useCallback((): BranchRecordMeta => {
    return {
      branchId: session.branch.id,
      branchName: session.branch.name,
      employeeId: session.employeeId,
      employeeName: session.employeeName,
    };
  }, [session]);

  const value = useMemo(
    () => ({
      currentBranch: session.branch,
      employeeId: session.employeeId,
      employeeName: session.employeeName,
      allBranches: BRANCHES,
      loginEmployee,
      logoutEmployee,
      setBranch,
      switchBranch,
      getRecordAuditMeta,
    }),
    [session, loginEmployee, logoutEmployee, setBranch, switchBranch, getRecordAuditMeta]
  );

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export function useBranch(): BranchContextType {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within a <BranchProvider>");
  }
  return context;
}

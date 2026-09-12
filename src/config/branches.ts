/**
 * Centralized Branch Configuration for ProBadminton
 *
 * Supports multi-branch operations with centralized branch definitions,
 * color schemes, and automatic branch detection from Employee ID prefixes.
 *
 * Scalable to 10-20+ branches (e.g. HYD, GCH, KPHB) without architectural changes.
 */

export interface Branch {
  id: string; // Internal stable identifier, e.g. "branch-nlg"
  name: string; // Display name, e.g. "Nallagandla"
  code: string; // Unique 3-letter prefix code, e.g. "NLG"
  color: string; // Brand/accent color hex or token
  badgeBg: string; // Tailwind background for branch badge
  badgeText: string; // Tailwind text color for branch badge
  badgeBorder: string; // Tailwind border color for branch badge
  address: string; // Physical club address
  phone: string; // Branch contact phone
}

export const BRANCHES: Branch[] = [
  {
    id: "branch-nlg",
    name: "Nallagandla",
    code: "NLG",
    color: "#2563eb", // Blue
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200",
    address: "Huda Layout, Nallagandla, Hyderabad",
    phone: "+91 98765 43210",
  },
  {
    id: "branch-mnk",
    name: "Manikonda",
    code: "MNK",
    color: "#7c3aed", // Purple
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-200",
    address: "Puppalguda Main Road, Manikonda, Hyderabad",
    phone: "+91 98765 43211",
  },
];

export const DEFAULT_BRANCH: Branch = BRANCHES[0]; // Nallagandla

export interface EmployeeInfo {
  employeeId: string;
  employeeName: string;
  branch: Branch;
}

/**
 * Standard dummy employee directory for development mode.
 */
export const DEMO_EMPLOYEES: Record<string, { name: string; branchCode: string }> = {
  NLG004: { name: "Rahul Sharma", branchCode: "NLG" },
  NLG001: { name: "Rahul Sharma", branchCode: "NLG" },
  NLG002: { name: "Sneha Patel", branchCode: "NLG" },
  NLG015: { name: "Amit Kumar", branchCode: "NLG" },
  MNK001: { name: "Vikram Reddy", branchCode: "MNK" },
  MNK004: { name: "Priya Verma", branchCode: "MNK" },
  MNK005: { name: "Ananya Iyer", branchCode: "MNK" },
  MNK021: { name: "Karthik Nair", branchCode: "MNK" },
};

export const DEFAULT_DEMO_EMPLOYEE: EmployeeInfo = {
  employeeId: "NLG004",
  employeeName: "Rahul Sharma",
  branch: DEFAULT_BRANCH,
};

/**
 * Find branch by its 3-letter code or id
 */
export function getBranchByCode(codeOrId: string): Branch | undefined {
  if (!codeOrId) return undefined;
  const clean = codeOrId.trim().toUpperCase();
  return BRANCHES.find(
    (b) => b.code.toUpperCase() === clean || b.id.toUpperCase() === clean
  );
}

/**
 * Find branch by its unique ID
 */
export function getBranchById(id: string): Branch | undefined {
  if (!id) return undefined;
  return BRANCHES.find((b) => b.id === id);
}

/**
 * Automatically determine the branch from an Employee ID prefix.
 *
 * Rules:
 * - If ID starts with "NLG" -> Nallagandla
 * - If ID starts with "MNK" -> Manikonda
 * - If empty or does not match any known branch -> Default to Nallagandla (Demo)
 */
export function detectBranchFromEmployeeId(employeeId?: string): Branch {
  if (!employeeId || !employeeId.trim()) {
    return DEFAULT_BRANCH;
  }

  const clean = employeeId.trim().toUpperCase();
  for (const branch of BRANCHES) {
    if (clean.startsWith(branch.code.toUpperCase())) {
      return branch;
    }
  }

  return DEFAULT_BRANCH;
}

/**
 * Resolves or generates dummy employee details for a given ID and detected branch.
 */
export function resolveEmployeeDetails(idInput?: string): EmployeeInfo {
  const cleanId = idInput?.trim().toUpperCase();

  if (!cleanId) {
    return { ...DEFAULT_DEMO_EMPLOYEE };
  }

  const branch = detectBranchFromEmployeeId(cleanId);

  // Check known demo employee lookup
  const known = DEMO_EMPLOYEES[cleanId];
  if (known) {
    return {
      employeeId: cleanId,
      employeeName: known.name,
      branch: getBranchByCode(known.branchCode) || branch,
    };
  }

  // If prefix matched a known branch but exact number is not pre-registered
  const matchedBranch = BRANCHES.find((b) =>
    cleanId.startsWith(b.code.toUpperCase())
  );
  if (matchedBranch) {
    const dummyName =
      matchedBranch.code === "MNK" ? "Priya Verma" : "Rahul Sharma";
    return {
      employeeId: cleanId,
      employeeName: dummyName,
      branch: matchedBranch,
    };
  }

  // Fallback if ID doesn't match any known branch: demo Nallagandla
  return {
    employeeId: "NLG004",
    employeeName: "Rahul Sharma",
    branch: DEFAULT_BRANCH,
  };
}

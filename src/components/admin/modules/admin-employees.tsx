"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Eye,
  Edit2,
  X,
  Users,
  Shield,
  Phone,
  Mail,
  Calendar,
  Lock,
  Clock,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import {
  AdminEmployee,
  EmployeeRole,
  EmployeeStatus,
} from "@/types/admin";
import { INITIAL_ADMIN_EMPLOYEES } from "@/data/admin-mock";
import { UniversalSearch } from "@/components/ui/universal-search";
import { universalMatch } from "@/lib/search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ROLES: EmployeeRole[] = [
  "Head Coach",
  "Assistant Coach",
  "Desk Manager",
  "Operations Lead",
  "Front Desk",
  "Senior Coach",
];

export function AdminEmployees() {
  const [employees, setEmployees] = useState<AdminEmployee[]>(
    INITIAL_ADMIN_EMPLOYEES
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");

  // Modal & Drawer State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<AdminEmployee | null>(
    null
  );
  const [viewingEmployee, setViewingEmployee] = useState<AdminEmployee | null>(
    null
  );

  // Form State for Add / Edit Modal
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    phone: "",
    email: "",
    role: "Desk Manager" as EmployeeRole,
    password: "",
    status: "Active" as EmployeeStatus,
    joiningDate: new Date().toISOString().split("T")[0],
    remarks: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Role Filter
      if (roleFilter !== "All" && emp.role !== roleFilter) {
        return false;
      }

      if (searchQuery.trim() && !universalMatch(emp, searchQuery)) {
        return false;
      }

      return true;
    });
  }, [employees, roleFilter, searchQuery]);

  // Open Modal for Add
  const handleOpenAdd = () => {
    const nextNum = employees.length + 1;
    const generatedId = `EMP${String(nextNum).padStart(3, "0")}`;

    setEmployeeToEdit(null);
    setFormData({
      employeeId: generatedId,
      name: "",
      phone: "",
      email: "",
      role: "Desk Manager",
      password: "••••••••",
      status: "Active",
      joiningDate: new Date().toISOString().split("T")[0],
      remarks: "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (emp: AdminEmployee) => {
    setEmployeeToEdit(emp);
    setFormData({
      employeeId: emp.employeeId,
      name: emp.name,
      phone: emp.phone,
      email: emp.email,
      role: emp.role,
      password: "••••••••",
      status: emp.status,
      joiningDate: emp.joiningDate,
      remarks: emp.remarks || "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Save Employee
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required.";
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Enter a valid 10-digit mobile number.";
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const timestamp = new Date().toISOString();

    if (employeeToEdit) {
      // Edit existing
      setEmployees((prev) =>
        prev.map((item) => {
          if (item.id === employeeToEdit.id) {
            const updated: AdminEmployee = {
              ...item,
              ...formData,
              updatedAt: timestamp,
            };
            return updated;
          }
          return item;
        })
      );
      if (viewingEmployee?.id === employeeToEdit.id) {
        setViewingEmployee((prev) =>
          prev
            ? {
                ...prev,
                ...formData,
                updatedAt: timestamp,
              }
            : null
        );
      }
    } else {
      // Create new
      const newRecord: AdminEmployee = {
        id: `emp-${crypto.randomUUID()}`,
        employeeId: formData.employeeId.trim().toUpperCase(),
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        role: formData.role,
        status: formData.status,
        joiningDate: formData.joiningDate,
        lastLogin: "Never logged in",
        remarks: formData.remarks.trim(),
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: "Super Admin (ADM001)",
      };
      setEmployees((prev) => [newRecord, ...prev]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Title + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Employees Directory
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Users className="w-3.5 h-3.5" />
              <span>{filteredEmployees.length} Total</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage staff credentials, role assignments, and system permissions.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl h-10 px-4 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <UniversalSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, ID, phone, or email..."
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 cursor-pointer"
            >
              <option value="All">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-xs">
              <tr>
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joining Date</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No employees matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-xs text-indigo-700">
                      {emp.employeeId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {emp.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {emp.phone}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 truncate max-w-[180px]">
                      {emp.email}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {emp.role}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border",
                          emp.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            emp.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          )}
                        />
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                      {emp.joiningDate}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {emp.lastLogin}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingEmployee(emp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="View Employee Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {employeeToEdit ? "Edit Employee Record" : "Add New Employee"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assign contact info, credentials, and permission tier.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="employeeId" required>
                  Employee ID
                </Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                  placeholder="e.g. EMP009"
                  className="font-mono uppercase h-10"
                  hasError={Boolean(errors.employeeId)}
                />
                {errors.employeeId && (
                  <p className="text-[11px] text-red-600">{errors.employeeId}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="name" required>
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Rajesh Sharma"
                  className="h-10"
                  hasError={Boolean(errors.name)}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="phone" required>
                    Mobile Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="10-digit number"
                    className="font-mono h-10"
                    hasError={Boolean(errors.phone)}
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" required>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="rajesh@probadminton.com"
                    className="h-10"
                    hasError={Boolean(errors.email)}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="role" required>
                    Operational Role
                  </Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as EmployeeRole,
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as EmployeeStatus,
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="password">Login Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="h-10"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) =>
                      setFormData({ ...formData, joiningDate: e.target.value })
                    }
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="remarks">Internal Remarks / Notes</Label>
                <textarea
                  id="remarks"
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  placeholder="Additional certifications, shift preference, or internal notes..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 text-xs text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 shadow-sm"
                >
                  {employeeToEdit ? "Save Changes" : "Create Employee"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Details Drawer */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-sm">
                  {viewingEmployee.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {viewingEmployee.name}
                  </h3>
                  <span className="font-mono text-xs font-bold text-indigo-600">
                    {viewingEmployee.employeeId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingEmployee(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1 text-sm">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500">
                  Account Status
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                    viewingEmployee.status === "Active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      viewingEmployee.status === "Active"
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    )}
                  />
                  {viewingEmployee.status}
                </span>
              </div>

              {/* Personal Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Personal Information
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-mono text-xs">
                      {viewingEmployee.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs">{viewingEmployee.email}</span>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Employment Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Designation
                    </span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {viewingEmployee.role}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Joining Date
                    </span>
                    <p className="font-bold text-slate-800 font-mono mt-0.5">
                      {viewingEmployee.joiningDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security & Access */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Access & Activity
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Last Portal Login:</span>
                    <span className="font-semibold text-slate-800">
                      {viewingEmployee.lastLogin}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Created By:</span>
                    <span className="font-mono text-slate-700">
                      {viewingEmployee.createdBy}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Last Modified:</span>
                    <span className="font-mono text-slate-700">
                      {viewingEmployee.updatedAt.split("T")[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {viewingEmployee.remarks && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Remarks
                  </h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {viewingEmployee.remarks}
                  </p>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingEmployee(null)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const emp = viewingEmployee;
                  setViewingEmployee(null);
                  handleOpenEdit(emp);
                }}
                className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

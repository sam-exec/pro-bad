"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Users,
  Heart,
  DollarSign,
  Eye,
  Edit2,
  X,
  Phone,
  Calendar,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { SuperMomsRecord } from "@/types/branch";
import { PaymentMethod, PaymentStatus } from "@/types/payment";
import { superMomsService } from "@/services/excel";
import { SearchBar } from "@/components/kids-coaching/search-bar";
import { StatusBadge } from "@/components/kids-coaching/status-badge";
import { PaymentMethodBadge } from "@/components/common/payment-method-badge";
import { PaymentMethodFilter } from "@/components/common/payment-method-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useBranch } from "@/context/branch-context";

const SUPER_MOMS_BATCHES = [
  "Morning Wellness Batch (09:00 AM - 10:30 AM)",
  "Midday Fitness Squad (11:00 AM - 12:30 PM)",
  "Evening Active Moms (04:30 PM - 06:00 PM)",
];

export function SuperMomsModule() {
  const { currentBranch, employeeId, employeeName } = useBranch();
  const [records, setRecords] = useState<SuperMomsRecord[]>(() =>
    superMomsService.getSnapshot(currentBranch.id)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");

  // Drawer and Modal States
  const [viewingRecord, setViewingRecord] = useState<SuperMomsRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<SuperMomsRecord | null>(null);

  // Form State
  const [memberName, setMemberName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [batch, setBatch] = useState<string>(SUPER_MOMS_BATCHES[0]);
  const [coach, setCoach] = useState("Coach Sunita Rao");
  const [monthlyFee, setMonthlyFee] = useState<number>(140);
  const [amountPaid, setAmountPaid] = useState<number>(140);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [joiningDate, setJoiningDate] = useState("2026-03-01");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setRecords(superMomsService.getSnapshot(currentBranch.id));
  }, [currentBranch.id]);

  useEffect(() => {
    if (recordToEdit) {
      setMemberName(recordToEdit.memberName);
      setMobileNumber(recordToEdit.mobileNumber);
      setBatch(recordToEdit.batch);
      setCoach(recordToEdit.coach);
      setMonthlyFee(recordToEdit.monthlyFee);
      setAmountPaid(recordToEdit.amountPaid);
      setPaymentMethod(recordToEdit.paymentMethod || "Cash");
      setJoiningDate(recordToEdit.joiningDate);
      setStatus(recordToEdit.status as "Active" | "Inactive");
    } else {
      setMemberName("");
      setMobileNumber("");
      setBatch(SUPER_MOMS_BATCHES[0]);
      setCoach("Coach Sunita Rao");
      setMonthlyFee(140);
      setAmountPaid(140);
      setPaymentMethod("Cash");
      setJoiningDate(new Date().toISOString().split("T")[0]);
      setStatus("Active");
    }
    setErrors({});
  }, [recordToEdit, isFormOpen]);

  // Branch isolation + Search + Batch + Payment Method filtering
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (r.branchId && r.branchId !== currentBranch.id) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const cleanDigits = searchQuery.trim().replace(/\D/g, "");
        const phone = r.mobileNumber.replace(/\D/g, "");
        const matchPhone = cleanDigits && phone.includes(cleanDigits);
        const matchName = r.memberName.toLowerCase().includes(q);
        if (!matchPhone && !matchName) return false;
      }
      if (selectedBatch !== "All" && r.batch !== selectedBatch) return false;
      if (paymentMethodFilter !== "All" && r.paymentMethod !== paymentMethodFilter) return false;
      return true;
    });
  }, [records, currentBranch.id, searchQuery, selectedBatch, paymentMethodFilter]);

  const metrics = useMemo(() => {
    const total = filteredRecords.length;
    const active = filteredRecords.filter((r) => r.status === "Active").length;
    const settled = filteredRecords.filter((r) => r.dueAmount === 0).length;
    const pendingDue = filteredRecords.reduce((sum, r) => sum + r.dueAmount, 0);
    return { total, active, settled, pendingDue };
  }, [filteredRecords]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!memberName.trim()) newErrors.memberName = "Mother's name is required.";
    if (!mobileNumber.trim() || !/^\d{10}$/.test(mobileNumber.replace(/\D/g, ""))) {
      newErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
    }
    if (amountPaid > 0 && !paymentMethod) {
      newErrors.paymentMethod = "Payment method is required when amount paid > 0.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dueAmount = Math.max(0, monthlyFee - amountPaid);
    const paymentStatus: PaymentStatus =
      amountPaid >= monthlyFee ? "Paid" : amountPaid > 0 ? "Partial" : "Pending";

    const payload = {
      memberName: memberName.trim(),
      mobileNumber: mobileNumber.trim(),
      batch,
      coach: coach.trim(),
      monthlyFee: Number(monthlyFee),
      amountPaid: Number(amountPaid),
      dueAmount,
      paymentMethod,
      paymentStatus,
      joiningDate,
      status,
    };

    if (recordToEdit) {
      await superMomsService.update(recordToEdit.id, payload, employeeId);
    } else {
      await superMomsService.create(payload, {
        branchId: currentBranch.id,
        branchName: currentBranch.name,
        employeeId,
        employeeName,
      });
    }

    setRecords(superMomsService.getSnapshot(currentBranch.id));
    setIsFormOpen(false);
    setRecordToEdit(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Super Moms Badminton
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
              📍 {currentBranch.name}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Specialized daytime badminton, fitness, and wellness batches for homemakers & mothers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold shadow-2xs flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Daytime Women's Fitness</span>
          </span>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Moms</p>
              <h3 className="text-xl font-bold text-slate-900">{metrics.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Players</p>
              <h3 className="text-xl font-bold text-emerald-600">{metrics.active}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Fees Settled</p>
              <h3 className="text-xl font-bold text-purple-600">{metrics.settled}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Pending Dues</p>
              <h3 className="text-xl font-bold text-amber-600">₹{metrics.pendingDue}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar: Search, Filters & Add Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Mobile Number or Name..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Batch Filter */}
          <div className="relative">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 shadow-xs cursor-pointer appearance-none"
            >
              <option value="All">All Batches</option>
              {SUPER_MOMS_BATCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Payment Method Filter */}
          <PaymentMethodFilter
            value={paymentMethodFilter}
            onChange={setPaymentMethodFilter}
          />

          <Button
            onClick={() => {
              setRecordToEdit(null);
              setIsFormOpen(true);
            }}
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold h-10 px-4 rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Super Mom</span>
          </Button>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(searchQuery || selectedBatch !== "All" || paymentMethodFilter !== "All") && (
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Active filters:</span>
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-medium">
                Search: {searchQuery}
              </span>
            )}
            {selectedBatch !== "All" && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                Batch: {selectedBatch}
              </span>
            )}
            {paymentMethodFilter !== "All" && (
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                Payment: {paymentMethodFilter}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedBatch("All");
              setPaymentMethodFilter("All");
            }}
            className="text-rose-600 hover:underline font-medium cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Table & Mobile Cards */}
      {filteredRecords.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center my-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-rose-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Super Moms found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1.5 mb-6">
            No registered members match the active search or filter criteria.
          </p>
          <Button
            onClick={() => {
              setRecordToEdit(null);
              setIsFormOpen(true);
            }}
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Register Super Mom</span>
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[calc(100vh-320px)] scrollbar-thin">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-xs">
                  <tr>
                    <th className="px-3.5 py-3 whitespace-nowrap">Serial No</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Mother Name</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Mobile Number</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Batch</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Coach</th>
                    <th className="px-3.5 py-3 text-right whitespace-nowrap">Monthly Fee</th>
                    <th className="px-3.5 py-3 text-right whitespace-nowrap">Paid</th>
                    <th className="px-3.5 py-3 text-right whitespace-nowrap">Due</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Payment Method</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Status</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Joining Date</th>
                    <th className="px-3.5 py-3 text-right whitespace-nowrap sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
                  {filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="px-3.5 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                        #{r.serialNumber}
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        {r.memberName}
                      </td>
                      <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {r.mobileNumber}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap max-w-[170px] truncate" title={r.batch}>
                        {r.batch}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap font-medium text-slate-800">
                        {r.coach}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                        ₹{r.monthlyFee}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                        ₹{r.amountPaid}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-rose-600 whitespace-nowrap">
                        ₹{r.dueAmount}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <PaymentMethodBadge method={r.paymentMethod} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <StatusBadge status={r.status as any} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-slate-500">
                        {r.joiningDate}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingRecord(r)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRecordToEdit(r);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3.5">
            {filteredRecords.map((r) => (
              <Card key={r.id} className="border-slate-200/90 bg-white shadow-xs rounded-xl overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{r.memberName}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">#{r.serialNumber}</p>
                    </div>
                    <StatusBadge status={r.status as any} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{r.mobileNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{r.joiningDate}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="text-slate-400">Batch: </span>
                    <span className="font-medium text-slate-800">{r.batch}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">
                        Paid: <strong className="text-emerald-600">₹{r.amountPaid}</strong>
                      </span>
                      <PaymentMethodBadge method={r.paymentMethod} />
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingRecord(r)}
                        className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRecordToEdit(r);
                          setIsFormOpen(true);
                        }}
                        className="h-8 px-2 text-xs text-slate-700 hover:text-slate-900"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Drawer */}
      {viewingRecord && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setViewingRecord(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-bold text-base">
                  {viewingRecord.memberName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">
                      {viewingRecord.memberName}
                    </h2>
                    <StatusBadge status={viewingRecord.status as any} />
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    #{viewingRecord.serialNumber} &bull; Super Moms Badminton
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Details */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Batch & Program */}
              <div className="space-y-2.5">
                <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  <span>Program & Batch Information</span>
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mobile:</span>
                    <span className="font-mono font-semibold text-slate-800">{viewingRecord.mobileNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Branch:</span>
                    <span className="font-semibold text-slate-800">{viewingRecord.branchName || currentBranch.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Batch:</span>
                    <span className="font-semibold text-slate-800 text-right">{viewingRecord.batch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Coach:</span>
                    <span className="font-semibold text-slate-800">{viewingRecord.coach}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Joining Date:</span>
                    <span className="font-semibold text-slate-800">{viewingRecord.joiningDate}</span>
                  </div>
                </div>
              </div>

              {/* Fee & Payment Details */}
              <div className="space-y-2.5">
                <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                  <span>Fee & Payment Details</span>
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-400">Monthly Fee</span>
                      <p className="font-semibold text-slate-800 font-mono mt-0.5">₹{viewingRecord.monthlyFee}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Amount Paid</span>
                      <p className="font-bold text-emerald-600 font-mono mt-0.5">₹{viewingRecord.amountPaid}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Due Amount</span>
                      <p className={`font-bold font-mono mt-0.5 ${viewingRecord.dueAmount > 0 ? "text-rose-600" : "text-slate-700"}`}>
                        ₹{viewingRecord.dueAmount}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 items-center">
                    <div>
                      <span className="text-slate-400 block mb-1">Payment Method</span>
                      <PaymentMethodBadge method={viewingRecord.paymentMethod} />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Payment Status</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          viewingRecord.paymentStatus === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : viewingRecord.paymentStatus === "Partial"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {viewingRecord.paymentStatus || (viewingRecord.dueAmount === 0 ? "Paid" : "Partial")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center gap-3">
              <Button variant="outline" onClick={() => setViewingRecord(null)} className="flex-1">
                Close
              </Button>
              <Button
                onClick={() => {
                  const toEdit = viewingRecord;
                  setViewingRecord(null);
                  setRecordToEdit(toEdit);
                  setIsFormOpen(true);
                }}
                className="flex-1 gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Super Mom</span>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFormOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 my-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {recordToEdit ? "Edit Super Mom Record" : "Register Super Mom"}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {currentBranch.name} Branch &bull; Daytime Training
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <Label htmlFor="smName" required className="text-xs">Mother's Name</Label>
                  <Input
                    id="smName"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="e.g. Radhika Sharma"
                    hasError={Boolean(errors.memberName)}
                    className="h-10 mt-1"
                  />
                  {errors.memberName && (
                    <p className="text-xs text-red-600 mt-1">{errors.memberName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="smMobile" required className="text-xs">Mobile Number</Label>
                    <Input
                      id="smMobile"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. 9876543210"
                      maxLength={10}
                      hasError={Boolean(errors.mobileNumber)}
                      className="h-10 mt-1 font-mono"
                    />
                    {errors.mobileNumber && (
                      <p className="text-xs text-red-600 mt-1">{errors.mobileNumber}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="smCoach" className="text-xs">Assigned Coach</Label>
                    <Input
                      id="smCoach"
                      value={coach}
                      onChange={(e) => setCoach(e.target.value)}
                      placeholder="e.g. Coach Sunita Rao"
                      className="h-10 mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="smBatch" className="text-xs">Training Batch</Label>
                  <select
                    id="smBatch"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full h-10 mt-1 rounded-lg border border-slate-200 px-3 text-xs bg-white text-slate-800"
                  >
                    {SUPER_MOMS_BATCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="smFee" className="text-xs">Monthly Fee (₹)</Label>
                    <Input
                      id="smFee"
                      type="number"
                      min={0}
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(Number(e.target.value))}
                      className="h-10 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smPaid" className="text-xs">Amount Paid (₹)</Label>
                    <Input
                      id="smPaid"
                      type="number"
                      min={0}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="h-10 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smPaymentMethod" required={amountPaid > 0} className="text-xs">
                      Payment Method
                    </Label>
                    <select
                      id="smPaymentMethod"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className={`w-full h-10 mt-1 rounded-lg border ${
                        errors.paymentMethod ? "border-red-300 ring-1 ring-red-300" : "border-slate-200"
                      } px-2.5 text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500`}
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                    </select>
                    {errors.paymentMethod && (
                      <p className="text-xs text-red-600 mt-1">{errors.paymentMethod}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="smJoining" className="text-xs">Joining Date</Label>
                    <Input
                      id="smJoining"
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="h-10 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smStatus" className="text-xs">Status</Label>
                    <select
                      id="smStatus"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
                      className="w-full h-10 mt-1 rounded-lg border border-slate-200 px-3 text-xs bg-white text-slate-800"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                    className="h-10 px-5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 px-5 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                  >
                    {recordToEdit ? "Update Super Mom" : "Register Super Mom"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

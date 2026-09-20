import React from "react";
import { Eye, Edit2, Clock, Plus, Phone, Calendar, Users } from "lucide-react";
import { FlexibleMembershipRecord } from "@/types/flexible-membership";
import { FlexibleStatusBadge } from "./flexible-status-badge";
import { HoursProgressBar } from "./hours-progress-bar";
import { PaymentMethodBadge } from "@/components/common/payment-method-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FlexibleMembershipTableProps {
  memberships: FlexibleMembershipRecord[];
  onView: (record: FlexibleMembershipRecord) => void;
  onEdit: (record: FlexibleMembershipRecord) => void;
  onAddNew: () => void;
}

export function FlexibleMembershipTable({
  memberships,
  onView,
  onEdit,
  onAddNew,
}: FlexibleMembershipTableProps) {
  if (memberships.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center my-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          No flexible memberships found.
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1.5 mb-6">
          No 30-hour flexible packages match the active search or status filters.
        </p>
        <Button
          onClick={onAddNew}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          <span>Add Flexible Membership</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop / Tablet Table (12 Columns) */}
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-320px)] scrollbar-thin">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-xs">
              <tr>
                <th className="px-3.5 py-3 whitespace-nowrap">Serial No</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Primary Member</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Primary Mobile</th>
                <th className="px-3.5 py-3 text-center whitespace-nowrap">Total Members</th>
                <th className="px-3.5 py-3 text-center whitespace-nowrap">Total Hours</th>
                <th className="px-3.5 py-3 text-center whitespace-nowrap">Hours Used</th>
                <th className="px-3.5 py-3 text-center whitespace-nowrap">Remaining</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Amount Paid</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Payment Method</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Joining Date</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Expiry Date (45d)</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Status</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Last Updated</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
              {memberships.map((m, index) => {
                const totalMembers = 1 + (m.additionalMembers?.length || 0);
                const hasAdditional = (m.additionalMembers?.length || 0) > 0;

                return (
                  <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                    {/* Serial Number */}
                    <td className="px-3.5 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {index + 1}
                    </td>

                    {/* Primary Name */}
                    <td className="px-3.5 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      {m.primaryMemberName}
                    </td>

                    {/* Mobile */}
                    <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">
                      {m.primaryMobileNumber}
                    </td>

                    {/* Total Members */}
                    <td className="px-3.5 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          hasAdditional
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                            : "bg-slate-100 text-slate-700"
                        }`}
                        title={
                          hasAdditional
                            ? `1 Primary + ${m.additionalMembers.length} Linked Family Members`
                            : "Single Member Package"
                        }
                      >
                        <Users className="w-3 h-3" />
                        <span>{totalMembers}</span>
                      </span>
                    </td>

                    {/* Total Hours */}
                    <td className="px-3.5 py-3 text-center font-bold text-slate-900 whitespace-nowrap">
                      {m.totalHours}h
                    </td>

                    {/* Hours Used */}
                    <td className="px-3.5 py-3 text-center font-semibold text-blue-600 whitespace-nowrap">
                      {m.hoursUsed}h
                    </td>

                    {/* Hours Remaining */}
                    <td className="px-3.5 py-3 text-center font-bold whitespace-nowrap">
                      <span
                        className={
                          m.hoursRemaining === 0
                            ? "text-slate-400"
                            : m.hoursRemaining <= 5
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }
                      >
                        {m.hoursRemaining}h
                      </span>
                    </td>

                    {/* Amount Paid */}
                    <td className="px-3.5 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                      ₹{m.amountPaid?.toLocaleString("en-IN") || 0}
                    </td>

                    {/* Payment Method */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <PaymentMethodBadge method={m.paymentMethod} />
                    </td>

                    {/* Joining Date */}
                    <td className="px-3.5 py-3 whitespace-nowrap text-slate-500">
                      {m.joiningDate}
                    </td>

                    {/* Expiry Date */}
                    <td className="px-3.5 py-3 whitespace-nowrap font-medium text-slate-800">
                      {m.expiryDate}
                    </td>

                    {/* Status */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <FlexibleStatusBadge status={m.status} />
                    </td>

                    {/* Last Updated */}
                    <td className="px-3.5 py-3 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(m.updatedAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onView(m)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(m)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit Package"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3.5">
        {memberships.map((m, index) => {
          const totalMembers = 1 + (m.additionalMembers?.length || 0);

          return (
            <Card
              key={m.id}
              className="border-slate-200/90 bg-white shadow-xs rounded-xl overflow-hidden"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {m.primaryMemberName}
                      </span>
                      <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full border border-indigo-100">
                        {totalMembers} {totalMembers === 1 ? "Member" : "Members"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {index + 1}
                    </p>
                  </div>
                  <FlexibleStatusBadge status={m.status} />
                </div>

                {/* Progress bar inside mobile card */}
                <div className="pt-1">
                  <HoursProgressBar
                    totalHours={m.totalHours}
                    hoursUsed={m.hoursUsed}
                    size="sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{m.primaryMobileNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Expires: {m.expiryDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Paid: <strong className="text-emerald-600">₹{m.amountPaid}</strong>
                    </span>
                    <PaymentMethodBadge method={m.paymentMethod} />
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(m)}
                      className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(m)}
                      className="h-8 px-2 text-xs text-slate-700 hover:text-slate-900"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

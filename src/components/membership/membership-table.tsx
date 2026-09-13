import React from "react";
import { Eye, Edit2, Users, Plus, Phone, Calendar, UserCheck } from "lucide-react";
import { MembershipRecord } from "@/types/membership";
import { StatusBadge } from "@/components/kids-coaching/status-badge";
import { PaymentBadge } from "@/components/kids-coaching/payment-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MembershipTableProps {
  memberships: MembershipRecord[];
  onView: (record: MembershipRecord) => void;
  onEdit: (record: MembershipRecord) => void;
  onAddNew: () => void;
}

export function MembershipTable({
  memberships,
  onView,
  onEdit,
  onAddNew,
}: MembershipTableProps) {
  if (memberships.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center my-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No memberships found.</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1.5 mb-6">
          No membership records match the current filter or phone search.
        </p>
        <Button onClick={onAddNew} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4" />
          <span>Add Membership</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop/Tablet Table (14 Columns) */}
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-280px)] scrollbar-thin">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-xs">
              <tr>
                <th className="px-3.5 py-3 whitespace-nowrap">Serial No</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Primary Member Name</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Primary Mobile</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Membership Plan</th>
                <th className="px-3.5 py-3 text-center whitespace-nowrap">Total Members</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Monthly Fee</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Amount Paid</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Due Amount</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Payment</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Joining Date</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Expiry Date</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Status</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Last Updated</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
              {memberships.map((m) => {
                const totalCount = 1 + (m.additionalMembers?.length || 0);
                const hasAdditional = (m.additionalMembers?.length || 0) > 0;

                return (
                  <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                    {/* Serial Number */}
                    <td className="px-3.5 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                      #{m.serialNumber}
                    </td>

                    {/* Primary Member Name */}
                    <td className="px-3.5 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      {m.primaryMemberName}
                    </td>

                    {/* Primary Mobile Number */}
                    <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">
                      {m.primaryMobileNumber}
                    </td>

                    {/* Membership Plan */}
                    <td
                      className="px-3.5 py-3 max-w-[180px] truncate text-slate-800 font-medium"
                      title={m.membershipPlan}
                    >
                      {m.membershipPlan}
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
                            : "Individual Membership"
                        }
                      >
                        <Users className="w-3 h-3" />
                        <span>{totalCount}</span>
                      </span>
                    </td>

                    {/* Monthly Fee */}
                    <td className="px-3.5 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                      ₹{m.monthlyFee}
                    </td>

                    {/* Amount Paid */}
                    <td className="px-3.5 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                      ₹{m.amountPaid}
                    </td>

                    {/* Due Amount */}
                    <td className="px-3.5 py-3 text-right font-semibold text-rose-600 whitespace-nowrap">
                      ₹{m.dueAmount}
                    </td>

                    {/* Payment Status */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <PaymentBadge status={m.paymentStatus} />
                    </td>

                    {/* Joining Date */}
                    <td className="px-3.5 py-3 whitespace-nowrap text-slate-500">
                      {m.joiningDate}
                    </td>

                    {/* Expiry Date */}
                    <td className="px-3.5 py-3 whitespace-nowrap text-slate-500">
                      {m.expiryDate}
                    </td>

                    {/* Status */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <StatusBadge status={m.status} />
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
                          title="View Membership & Family"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(m)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit Membership"
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

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3.5">
        {memberships.map((m) => {
          const totalCount = 1 + (m.additionalMembers?.length || 0);

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
                        {totalCount} {totalCount === 1 ? "Member" : "Members"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      #{m.serialNumber} &bull; {m.membershipPlan}
                    </p>
                  </div>
                  <StatusBadge status={m.status} />
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
                  {m.additionalMembers?.length > 0 && (
                    <div className="col-span-2 text-[11px] text-slate-500 truncate">
                      <span className="font-medium text-slate-700">Family: </span>
                      {m.additionalMembers.map((am) => am.name).join(", ")}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <PaymentBadge status={m.paymentStatus} />
                    <span className="text-xs font-semibold text-slate-700">
                      ₹{m.amountPaid}{" "}
                      {m.dueAmount > 0 && (
                        <span className="text-rose-600 ml-1">
                          Due: ₹{m.dueAmount}
                        </span>
                      )}
                    </span>
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

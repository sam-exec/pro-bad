import React from "react";
import { Eye, Edit2, Users, Plus, Phone, Calendar } from "lucide-react";
import { Student } from "@/types/kids-coaching";
import { StudentRow } from "./student-row";
import { StatusBadge } from "./status-badge";
import { PaymentBadge } from "./payment-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface StudentTableProps {
  students: Student[];
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onAddNew: () => void;
}

export function StudentTable({
  students,
  onView,
  onEdit,
  onAddNew,
}: StudentTableProps) {
  if (students.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center my-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No students found.</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1.5 mb-6">
          No student records match the active search criteria or month filter. Try changing your search or add a new student.
        </p>
        <Button onClick={onAddNew} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop & Tablet Table (Hidden on small mobile screens) */}
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-280px)] scrollbar-thin">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-xs">
              <tr>
                <th className="px-3.5 py-3 whitespace-nowrap">Serial No</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Student Name</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Parent Name</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Mobile Number</th>
                <th className="px-3.5 py-3 text-center whitespace-nowrap">Age</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Gender</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Joining Date</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Batch</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Coach</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Monthly Fee</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Amount Paid</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Due Amount</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Payment</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Month</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Status</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Last Updated</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {students.map((student) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  onView={onView}
                  onEdit={onEdit}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (Shown on screens < 768px) */}
      <div className="md:hidden space-y-3.5">
        {students.map((student) => (
          <Card
            key={student.id}
            className="border-slate-200/90 bg-white shadow-xs rounded-xl overflow-hidden"
          >
            <CardContent className="p-4 space-y-3">
              {/* Top Row: Name, ID, Status */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {student.studentName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({student.gender}, {student.age}y)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    #{student.serialNumber}
                  </p>
                </div>
                <StatusBadge status={student.status} />
              </div>

              {/* Middle: Parent, Phone, Batch */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{student.mobileNumber}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{student.currentMonth} {student.year}</span>
                </div>
                <div className="col-span-2 text-[11px] text-slate-500 truncate">
                  <span className="font-medium text-slate-700">Coach:</span> {student.coach} &bull; {student.batch}
                </div>
              </div>

              {/* Bottom: Fees & Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <PaymentBadge status={student.paymentStatus} />
                  <span className="text-xs font-semibold text-slate-700">
                    Paid: <span className="text-emerald-600">₹{student.amountPaid}</span>
                    {student.dueAmount > 0 && (
                      <span className="text-rose-600 ml-1.5">Due: ₹{student.dueAmount}</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(student)}
                    className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(student)}
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
  );
}

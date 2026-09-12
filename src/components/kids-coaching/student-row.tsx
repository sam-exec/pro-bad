import React from "react";
import { Eye, Edit2 } from "lucide-react";
import { Student } from "@/types/kids-coaching";
import { StatusBadge } from "./status-badge";
import { PaymentBadge } from "./payment-badge";

interface StudentRowProps {
  student: Student;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
}

export function StudentRow({ student, onView, onEdit }: StudentRowProps) {
  return (
    <tr className="hover:bg-blue-50/40 transition-colors border-b border-slate-200/80 text-xs text-slate-700">
      {/* 1. Student ID */}
      <td className="px-3.5 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">
        {student.studentId}
      </td>

      {/* 2. Student Name */}
      <td className="px-3.5 py-3 font-semibold text-slate-900 whitespace-nowrap">
        {student.studentName}
      </td>

      {/* 3. Parent Name */}
      <td className="px-3.5 py-3 text-slate-600 whitespace-nowrap">
        {student.parentName}
      </td>

      {/* 4. Mobile Number */}
      <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">
        {student.mobileNumber}
      </td>

      {/* 5. Age */}
      <td className="px-3.5 py-3 text-center whitespace-nowrap">
        {student.age}
      </td>

      {/* 6. Gender */}
      <td className="px-3.5 py-3 whitespace-nowrap">
        {student.gender}
      </td>

      {/* 7. Joining Date */}
      <td className="px-3.5 py-3 whitespace-nowrap text-slate-500">
        {student.joiningDate}
      </td>

      {/* 8. Batch */}
      <td className="px-3.5 py-3 max-w-[180px] truncate" title={student.batch}>
        {student.batch}
      </td>

      {/* 9. Coach */}
      <td className="px-3.5 py-3 whitespace-nowrap font-medium text-slate-800">
        {student.coach}
      </td>

      {/* 10. Monthly Fees */}
      <td className="px-3.5 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
        ₹{student.monthlyFee}
      </td>

      {/* 11. Amount Paid */}
      <td className="px-3.5 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
        ₹{student.amountPaid}
      </td>

      {/* 12. Due Amount */}
      <td className="px-3.5 py-3 text-right font-semibold text-rose-600 whitespace-nowrap">
        ₹{student.dueAmount}
      </td>

      {/* 13. Payment Status */}
      <td className="px-3.5 py-3 whitespace-nowrap">
        <PaymentBadge status={student.paymentStatus} />
      </td>

      {/* 14. Current Month */}
      <td className="px-3.5 py-3 whitespace-nowrap text-slate-600">
        {student.currentMonth} {student.year}
      </td>

      {/* 15. Status */}
      <td className="px-3.5 py-3 whitespace-nowrap">
        <StatusBadge status={student.status} />
      </td>

      {/* 16. Last Updated */}
      <td className="px-3.5 py-3 whitespace-nowrap text-slate-400 text-[11px]">
        {new Date(student.updatedAt).toLocaleDateString()}
      </td>

      {/* 17. Actions */}
      <td className="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs group-hover:bg-blue-50/90 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onView(student)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="View Student Details"
            aria-label={`View ${student.studentName}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(student)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Edit Student"
            aria-label={`Edit ${student.studentName}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

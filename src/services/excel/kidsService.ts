/**
 * Kids Coaching Module Service
 * 
 * Future Excel Mapping:
 * Kids Coaching Module     -> Kids Coaching.xlsx -> Kids Coaching Worksheet
 * Kids Coaching 1-1 Module -> Kids Coaching.xlsx -> Kids Coaching 1-1 Worksheet
 * 
 * Data Flow:
 * Employee UI -> kidsService -> excelService -> Kids Coaching.xlsx [Both Worksheets]
 */

import { excelService } from "./excelService";
import { EXCEL_WORKSHEETS } from "@/types/excel";
import { Student, StudentFormData } from "@/types/kids-coaching";
import { Kids1on1Student } from "@/types/coaching-modules";
import { BranchRecordMeta } from "@/types/branch";

export class KidsService {
  // Master Workbook: Kids Coaching.xlsx
  // Worksheet 1: Kids Coaching
  private readonly groupWorkbook = EXCEL_WORKSHEETS.KIDS_COACHING.workbook;
  private readonly groupWorksheet = EXCEL_WORKSHEETS.KIDS_COACHING.worksheet;

  // Worksheet 2: Kids Coaching 1-1
  private readonly oneOnOneWorkbook = EXCEL_WORKSHEETS.KIDS_COACHING_1ON1.workbook;
  private readonly oneOnOneWorksheet = EXCEL_WORKSHEETS.KIDS_COACHING_1ON1.worksheet;

  // ==========================================================================
  // 1. Kids Coaching (Group) - Worksheet 1
  // ==========================================================================

  getSnapshot(branchId?: string): Student[] {
    const students = excelService.getWorksheetSnapshot<Student>(
      this.groupWorkbook,
      this.groupWorksheet
    );
    if (branchId) {
      return students.filter((s) => s.branchId === branchId);
    }
    return students;
  }

  async getAll(branchId?: string): Promise<Student[]> {
    const all = await excelService.readWorksheet<Student>(
      this.groupWorkbook,
      this.groupWorksheet
    );
    if (branchId) {
      return all.filter((s) => s.branchId === branchId);
    }
    return all;
  }

  async getById(id: string): Promise<Student | null> {
    return excelService.readRecordById<Student>(
      this.groupWorkbook,
      this.groupWorksheet,
      id
    );
  }

  async search(query: string, branchId?: string): Promise<Student[]> {
    const cleanQuery = query.trim().replace(/\D/g, "");
    return excelService.queryWorksheet<Student>(
      this.groupWorkbook,
      this.groupWorksheet,
      (s) => {
        if (branchId && s.branchId !== branchId) return false;
        if (!cleanQuery) return true;
        const cleanPhone = s.mobileNumber.replace(/\D/g, "");
        return cleanPhone.includes(cleanQuery) || s.studentName.toLowerCase().includes(query.toLowerCase());
      }
    );
  }

  /**
   * Cross-module validation:
   * Returns true if student already exists in Kids One-to-One
   */
  async existsIn1on1(studentName: string, phone?: string): Promise<boolean> {
    const all1on1 = await this.getAll1on1();
    const cleanName = studentName.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/\D/g, "") : "";

    return all1on1.some((s) => {
      const matchName = s.studentName.trim().toLowerCase() === cleanName;
      const matchPhone = cleanPhone && s.parentMobile.replace(/\D/g, "") === cleanPhone;
      return matchName || matchPhone;
    });
  }

  /**
   * Cross-module validation:
   * Returns true if student already exists in Kids Coaching (Group)
   */
  async existsInGroup(studentName: string, phone?: string): Promise<boolean> {
    const allGroup = await this.getAll();
    const cleanName = studentName.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/\D/g, "") : "";

    return allGroup.some((s) => {
      const matchName = s.studentName.trim().toLowerCase() === cleanName;
      const matchPhone = cleanPhone && s.mobileNumber.replace(/\D/g, "") === cleanPhone;
      return matchName || matchPhone;
    });
  }

  async create(
    formData: StudentFormData,
    auditMeta: BranchRecordMeta
  ): Promise<Student> {
    // 1. Cross-module enrollment check: Prevent duplicate in Kids One-to-One
    const alreadyIn1on1 = await this.existsIn1on1(
      formData.studentName,
      formData.mobileNumber
    );
    if (alreadyIn1on1) {
      throw new Error(
        `Enrollment Blocked: Student "${formData.studentName}" is already enrolled in Kids One-to-One. A student cannot be enrolled in both Kids Coaching and Kids One-to-One.`
      );
    }

    const dueAmount = Math.max(0, formData.monthlyFee - formData.amountPaid);
    const paymentStatus =
      dueAmount === 0 && formData.amountPaid > 0
        ? "Paid"
        : formData.amountPaid > 0 && dueAmount > 0
        ? "Partial"
        : "Pending";

    const timestamp = new Date().toISOString();
    const allStudents = await this.getAll(); // Global to get max sequence
    
    // Auto-generate sequential Serial Number (Never reused, continues from latest)
    const maxSerial = allStudents.reduce(
      (max, s) => Math.max(max, s.serialNumber || 0),
      0
    );
    const serialNumber = maxSerial + 1;
    const formattedStudentId = `KC-2026-${String(serialNumber).padStart(3, "0")}`;
    const id = `kc-${Date.now()}`;

    const newStudent: Student = {
      ...formData,
      id,
      recordId: id,
      serialNumber,
      studentId: formattedStudentId,
      dueAmount,
      paymentStatus,
      paymentMethod: formData.paymentMethod || "UPI",
      status: formData.status === "Inactive" ? "Inactive" : "Active",
      branchId: auditMeta.branchId,
      branchName: auditMeta.branchName,
      employeeId: auditMeta.employeeId,
      employeeName: auditMeta.employeeName,
      createdBy: auditMeta.employeeId,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastModifiedBy: auditMeta.employeeId,
    };

    return excelService.writeRecord<Student>(
      this.groupWorkbook,
      this.groupWorksheet,
      newStudent
    );
  }

  async update(
    id: string,
    updates: Partial<Student>,
    modifierEmployeeId: string
  ): Promise<Student> {
    return excelService.updateRecord<Student>(
      this.groupWorkbook,
      this.groupWorksheet,
      id,
      updates,
      modifierEmployeeId
    );
  }

  async delete(id: string): Promise<boolean> {
    return excelService.deleteRecord(
      this.groupWorkbook,
      this.groupWorksheet,
      id
    );
  }

  // ==========================================================================
  // 2. Kids Coaching 1-1 - Worksheet 2
  // ==========================================================================

  getSnapshot1on1(branchId?: string): Kids1on1Student[] {
    const records = excelService.getWorksheetSnapshot<Kids1on1Student>(
      this.oneOnOneWorkbook,
      this.oneOnOneWorksheet
    );
    if (branchId) {
      return records.filter((r) => r.branchId === branchId);
    }
    return records;
  }

  async getAll1on1(branchId?: string): Promise<Kids1on1Student[]> {
    const all = await excelService.readWorksheet<Kids1on1Student>(
      this.oneOnOneWorkbook,
      this.oneOnOneWorksheet
    );
    if (branchId) {
      return all.filter((r) => r.branchId === branchId);
    }
    return all;
  }

  async getById1on1(id: string): Promise<Kids1on1Student | null> {
    return excelService.readRecordById<Kids1on1Student>(
      this.oneOnOneWorkbook,
      this.oneOnOneWorksheet,
      id
    );
  }

  async search1on1(query: string, branchId?: string): Promise<Kids1on1Student[]> {
    const cleanPhoneQuery = query.trim().replace(/\D/g, "");
    const cleanText = query.trim().toLowerCase();
    return excelService.queryWorksheet<Kids1on1Student>(
      this.oneOnOneWorkbook,
      this.oneOnOneWorksheet,
      (item) => {
        if (branchId && item.branchId !== branchId) return false;
        if (!cleanText) return true;
        const phone = item.parentMobile.replace(/\D/g, "");
        return (
          phone.includes(cleanPhoneQuery) ||
          item.studentName.toLowerCase().includes(cleanText) ||
          item.parentName.toLowerCase().includes(cleanText)
        );
      }
    );
  }

  async create1on1(
    data: Omit<
      Kids1on1Student,
      | "id"
      | "recordId"
      | "serialNumber"
      | "studentId"
      | "branchId"
      | "branchName"
      | "employeeId"
      | "employeeName"
      | "createdAt"
      | "updatedAt"
      | "lastModifiedBy"
      | "createdBy"
    >,
    auditMeta: BranchRecordMeta
  ): Promise<Kids1on1Student> {
    // 1. Cross-module enrollment check: Prevent duplicate in Kids Coaching Group
    const alreadyInGroup = await this.existsInGroup(
      data.studentName,
      data.parentMobile
    );
    if (alreadyInGroup) {
      throw new Error(
        `Enrollment Blocked: Student "${data.studentName}" is already enrolled in Kids Coaching. A student cannot be enrolled in both Kids Coaching and Kids One-to-One.`
      );
    }

    const timestamp = new Date().toISOString();
    const all1on1 = await this.getAll1on1();
    
    // Auto-generate separate sequential Serial Number for Kids 1-on-1 (Never reused)
    const maxSerial = all1on1.reduce(
      (max, s) => Math.max(max, s.serialNumber || 0),
      0
    );
    const serialNumber = maxSerial + 1;
    const formattedId = `KC1-2026-${String(serialNumber).padStart(3, "0")}`;
    const id = `kc1-${Date.now()}`;

    const newRecord: Kids1on1Student = {
      ...data,
      id,
      recordId: id,
      serialNumber,
      studentId: formattedId,
      paymentMethod: data.paymentMethod || "UPI",
      status: data.status === "Inactive" ? "Inactive" : "Active",
      branchId: auditMeta.branchId,
      branchName: auditMeta.branchName,
      employeeId: auditMeta.employeeId,
      employeeName: auditMeta.employeeName,
      createdBy: auditMeta.employeeId,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastModifiedBy: auditMeta.employeeId,
    };

    return excelService.writeRecord<Kids1on1Student>(
      this.oneOnOneWorkbook,
      this.oneOnOneWorksheet,
      newRecord
    );
  }

  async update1on1(
    id: string,
    updates: Partial<Kids1on1Student>,
    modifierEmployeeId: string
  ): Promise<Kids1on1Student> {
    return excelService.updateRecord<Kids1on1Student>(
      this.oneOnOneWorkbook,
      this.oneOnOneWorksheet,
      id,
      updates,
      modifierEmployeeId
    );
  }

  async delete1on1(id: string): Promise<boolean> {
    return excelService.deleteRecord(
      this.oneOnOneWorkbook,
      this.oneOnOneWorksheet,
      id
    );
  }
}

export const kidsService = new KidsService();
export default kidsService;

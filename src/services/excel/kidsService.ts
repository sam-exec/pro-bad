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

  async create(
    formData: StudentFormData,
    auditMeta: BranchRecordMeta
  ): Promise<Student> {
    const dueAmount = Math.max(0, formData.monthlyFee - formData.amountPaid);
    const paymentStatus =
      dueAmount === 0 && formData.amountPaid > 0
        ? "Paid"
        : formData.amountPaid > 0 && dueAmount > 0
        ? "Partial"
        : "Pending";

    const timestamp = new Date().toISOString();
    const existing = await this.getAll(auditMeta.branchId);
    const count = existing.length + 1;
    const formattedStudentId = `KC-2026-${String(count).padStart(3, "0")}`;
    const id = `kc-${Date.now()}`;

    const newStudent: Student = {
      ...formData,
      id,
      recordId: id,
      studentId: formattedStudentId,
      dueAmount,
      paymentStatus,
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
    const timestamp = new Date().toISOString();
    const existing = await this.getAll1on1(auditMeta.branchId);
    const count = existing.length + 1;
    const formattedId = `KC1-2026-${String(count).padStart(3, "0")}`;
    const id = `kc1-${Date.now()}`;

    const newRecord: Kids1on1Student = {
      ...data,
      id,
      recordId: id,
      studentId: formattedId,
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

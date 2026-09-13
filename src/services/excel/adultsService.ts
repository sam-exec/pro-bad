/**
 * Adults Coaching Module Service
 * 
 * Future Excel Mapping:
 * Adults Coaching Module     -> Adults Coaching.xlsx -> Adults Coaching Worksheet
 * Adults Coaching 1-1 Module -> Adults Coaching.xlsx -> Adults Coaching 1-1 Worksheet
 * 
 * Data Flow:
 * Employee UI -> adultsService -> excelService -> Adults Coaching.xlsx [Both Worksheets]
 */

import { excelService } from "./excelService";
import { EXCEL_WORKSHEETS } from "@/types/excel";
import { AdultCoachMember, Adult1on1Member } from "@/types/coaching-modules";
import { BranchRecordMeta } from "@/types/branch";

export class AdultsService {
  // Master Workbook: Adults Coaching.xlsx
  // Worksheet 1: Adults Coaching
  private readonly groupWorkbook = EXCEL_WORKSHEETS.ADULTS_COACHING.workbook;
  private readonly groupWorksheet = EXCEL_WORKSHEETS.ADULTS_COACHING.worksheet;

  // Worksheet 2: Adults Coaching 1-1
  private readonly oneOnOneWorkbook = EXCEL_WORKSHEETS.ADULTS_COACHING_1ON1.workbook;
  private readonly oneOnOneWorksheet = EXCEL_WORKSHEETS.ADULTS_COACHING_1ON1.worksheet;

  // ==========================================================================
  // 1. Adults Coaching (Group) - Worksheet 1
  // ==========================================================================

  getSnapshot(branchId?: string): AdultCoachMember[] {
    const records = excelService.getWorksheetSnapshot<AdultCoachMember>(
      this.groupWorkbook,
      this.groupWorksheet
    );
    if (branchId) {
      return records.filter((r) => r.branchId === branchId);
    }
    return records;
  }

  async getAll(branchId?: string): Promise<AdultCoachMember[]> {
    const all = await excelService.readWorksheet<AdultCoachMember>(
      this.groupWorkbook,
      this.groupWorksheet
    );
    if (branchId) {
      return all.filter((r) => r.branchId === branchId);
    }
    return all;
  }

  async getById(id: string): Promise<AdultCoachMember | null> {
    return excelService.readRecordById<AdultCoachMember>(
      this.groupWorkbook,
      this.groupWorksheet,
      id
    );
  }

  async search(query: string, branchId?: string): Promise<AdultCoachMember[]> {
    const cleanPhone = query.trim().replace(/\D/g, "");
    const cleanText = query.trim().toLowerCase();
    return excelService.queryWorksheet<AdultCoachMember>(
      this.groupWorkbook,
      this.groupWorksheet,
      (item) => {
        if (branchId && item.branchId !== branchId) return false;
        if (!cleanText) return true;
        const phone = item.mobileNumber.replace(/\D/g, "");
        return phone.includes(cleanPhone) || item.memberName.toLowerCase().includes(cleanText);
      }
    );
  }

  async create(
    data: Omit<
      AdultCoachMember,
      | "id"
      | "recordId"
      | "serialNumber"
      | "memberId"
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
  ): Promise<AdultCoachMember> {
    const timestamp = new Date().toISOString();
    const existing = await this.getAll();
    const maxSerial = existing.reduce(
      (max, m) => Math.max(max, m.serialNumber || 0),
      0
    );
    const serialNumber = maxSerial + 1;
    const formattedId = `AC-2026-${String(serialNumber).padStart(3, "0")}`;
    const id = `ac-${Date.now()}`;

    const newRecord: AdultCoachMember = {
      ...data,
      id,
      recordId: id,
      serialNumber,
      memberId: formattedId,
      branchId: auditMeta.branchId,
      branchName: auditMeta.branchName,
      employeeId: auditMeta.employeeId,
      employeeName: auditMeta.employeeName,
      createdBy: auditMeta.employeeId,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastModifiedBy: auditMeta.employeeId,
    };

    return excelService.writeRecord<AdultCoachMember>(
      this.groupWorkbook,
      this.groupWorksheet,
      newRecord
    );
  }

  async update(
    id: string,
    updates: Partial<AdultCoachMember>,
    modifierEmployeeId: string
  ): Promise<AdultCoachMember> {
    return excelService.updateRecord<AdultCoachMember>(
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
  // 2. Adults Coaching 1-1 - Worksheet 2
  // ==========================================================================

  getSnapshot1on1(branchId?: string): Adult1on1Member[] {
    const records = excelService.getWorksheetSnapshot<Adult1on1Member>(
      this.oneOnOneWorkbook,
      this.oneOnOneWorksheet
    );
    if (branchId) {
      return records.filter((r) => r.branchId === branchId);
    }
    return records;
  }

  async getAll1on1(branchId?: string): Promise<Adult1on1Member[]> {
    const all = await excelService.readWorksheet<Adult1on1Member>(
      this.oneOnOneWorkbook,
      this.oneOnOneWorksheet
    );
    if (branchId) {
      return all.filter((r) => r.branchId === branchId);
    }
    return all;
  }

  async getById1on1(id: string): Promise<Adult1on1Member | null> {
    return excelService.readRecordById<Adult1on1Member>(
      this.oneOnOneWorkbook,
      this.oneOnOneWorksheet,
      id
    );
  }

  async search1on1(query: string, branchId?: string): Promise<Adult1on1Member[]> {
    const cleanPhone = query.trim().replace(/\D/g, "");
    const cleanText = query.trim().toLowerCase();
    return excelService.queryWorksheet<Adult1on1Member>(
      this.oneOnOneWorkbook,
      this.oneOnOneWorksheet,
      (item) => {
        if (branchId && item.branchId !== branchId) return false;
        if (!cleanText) return true;
        const phone = item.mobileNumber.replace(/\D/g, "");
        return phone.includes(cleanPhone) || item.memberName.toLowerCase().includes(cleanText);
      }
    );
  }

  async create1on1(
    data: Omit<
      Adult1on1Member,
      | "id"
      | "recordId"
      | "serialNumber"
      | "memberId"
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
  ): Promise<Adult1on1Member> {
    const timestamp = new Date().toISOString();
    const existing = await this.getAll1on1();
    const maxSerial = existing.reduce(
      (max, m) => Math.max(max, m.serialNumber || 0),
      0
    );
    const serialNumber = maxSerial + 1;
    const formattedId = `AC1-2026-${String(serialNumber).padStart(3, "0")}`;
    const id = `ac1-${Date.now()}`;

    const newRecord: Adult1on1Member = {
      ...data,
      id,
      recordId: id,
      serialNumber,
      memberId: formattedId,
      branchId: auditMeta.branchId,
      branchName: auditMeta.branchName,
      employeeId: auditMeta.employeeId,
      employeeName: auditMeta.employeeName,
      createdBy: auditMeta.employeeId,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastModifiedBy: auditMeta.employeeId,
    };

    return excelService.writeRecord<Adult1on1Member>(
      this.oneOnOneWorkbook,
      this.oneOnOneWorksheet,
      newRecord
    );
  }

  async update1on1(
    id: string,
    updates: Partial<Adult1on1Member>,
    modifierEmployeeId: string
  ): Promise<Adult1on1Member> {
    return excelService.updateRecord<Adult1on1Member>(
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

export const adultsService = new AdultsService();
export default adultsService;

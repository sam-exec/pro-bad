/**
 * Super Moms Module Service
 * 
 * Future Excel Mapping:
 * Super Moms Module -> Super Moms.xlsx -> Super Moms Worksheet
 * 
 * Data Flow:
 * Employee UI -> superMomsService -> excelService -> Super Moms.xlsx [Super Moms Worksheet]
 */

import { excelService } from "./excelService";
import { EXCEL_WORKSHEETS } from "@/types/excel";
import { SuperMomsRecord, BranchRecordMeta } from "@/types/branch";

export class SuperMomsService {
  private readonly workbook = EXCEL_WORKSHEETS.SUPER_MOMS.workbook;
  private readonly worksheet = EXCEL_WORKSHEETS.SUPER_MOMS.worksheet;

  getSnapshot(branchId?: string): SuperMomsRecord[] {
    const records = excelService.getWorksheetSnapshot<SuperMomsRecord>(
      this.workbook,
      this.worksheet
    );
    if (branchId) {
      return records.filter((r) => r.branchId === branchId);
    }
    return records;
  }

  async getAll(branchId?: string): Promise<SuperMomsRecord[]> {
    const all = await excelService.readWorksheet<SuperMomsRecord>(
      this.workbook,
      this.worksheet
    );
    if (branchId) {
      return all.filter((r) => r.branchId === branchId);
    }
    return all;
  }

  async getById(id: string): Promise<SuperMomsRecord | null> {
    return excelService.readRecordById<SuperMomsRecord>(
      this.workbook,
      this.worksheet,
      id
    );
  }

  async search(query: string, branchId?: string): Promise<SuperMomsRecord[]> {
    const cleanPhone = query.trim().replace(/\D/g, "");
    const cleanText = query.trim().toLowerCase();
    return excelService.queryWorksheet<SuperMomsRecord>(
      this.workbook,
      this.worksheet,
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
      SuperMomsRecord,
      | "id"
      | "recordId"
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
  ): Promise<SuperMomsRecord> {
    const timestamp = new Date().toISOString();
    const existing = await this.getAll(auditMeta.branchId);
    const count = existing.length + 1;
    const formattedId = `SM-2026-${String(count).padStart(3, "0")}`;
    const id = `sm-${Date.now()}`;

    const newRecord: SuperMomsRecord = {
      ...data,
      id,
      recordId: id,
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

    return excelService.writeRecord<SuperMomsRecord>(
      this.workbook,
      this.worksheet,
      newRecord
    );
  }

  async update(
    id: string,
    updates: Partial<SuperMomsRecord>,
    modifierEmployeeId: string
  ): Promise<SuperMomsRecord> {
    return excelService.updateRecord<SuperMomsRecord>(
      this.workbook,
      this.worksheet,
      id,
      updates,
      modifierEmployeeId
    );
  }

  async delete(id: string): Promise<boolean> {
    return excelService.deleteRecord(this.workbook, this.worksheet, id);
  }
}

export const superMomsService = new SuperMomsService();
export default superMomsService;

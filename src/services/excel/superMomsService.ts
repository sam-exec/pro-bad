/**
 * Super Moms Module Service
 * 
 * Master Excel Mapping:
 * Super Moms Module -> Super Moms.xlsx -> Super Moms Worksheet
 * 
 * Single Location Architecture
 */

import { excelService } from "./excelService";
import { EXCEL_WORKSHEETS, EmployeeAuditMeta } from "@/types/excel";
import { SuperMomsRecord } from "@/types/coaching-modules";

export class SuperMomsService {
  private readonly workbook = EXCEL_WORKSHEETS.SUPER_MOMS.workbook;
  private readonly worksheet = EXCEL_WORKSHEETS.SUPER_MOMS.worksheet;

  getSnapshot(): SuperMomsRecord[] {
    return excelService.getWorksheetSnapshot<SuperMomsRecord>(
      this.workbook,
      this.worksheet
    );
  }

  async getAll(): Promise<SuperMomsRecord[]> {
    return excelService.readWorksheet<SuperMomsRecord>(
      this.workbook,
      this.worksheet
    );
  }

  async getById(id: string): Promise<SuperMomsRecord | null> {
    return excelService.readRecordById<SuperMomsRecord>(
      this.workbook,
      this.worksheet,
      id
    );
  }

  async search(query: string): Promise<SuperMomsRecord[]> {
    const cleanPhone = query.trim().replace(/\D/g, "");
    const cleanText = query.trim().toLowerCase();
    return excelService.queryWorksheet<SuperMomsRecord>(
      this.workbook,
      this.worksheet,
      (item) => {
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
      | "employeeId"
      | "employeeName"
      | "createdAt"
      | "updatedAt"
      | "lastModifiedBy"
      | "createdBy"
    >,
    auditMeta: EmployeeAuditMeta
  ): Promise<SuperMomsRecord> {
    const timestamp = new Date().toISOString();
    const existing = await this.getAll();
    const maxSerial = existing.reduce((m, r) => Math.max(m, r.serialNumber || 0), 0);
    const serialNumber = (data as any).serialNumber ?? (maxSerial + 1);
    const formattedId = `SM-2026-${String(serialNumber).padStart(3, "0")}`;
    const id = `sm-${crypto.randomUUID()}`;

    const newRecord: SuperMomsRecord = {
      ...data,
      id,
      recordId: id,
      serialNumber,
      memberId: formattedId,
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

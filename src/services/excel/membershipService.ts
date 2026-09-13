/**
 * Membership Module Service
 * 
 * Future Excel Mapping:
 * Membership Module          -> Membership.xlsx -> Membership Worksheet
 * Flexible Membership Module -> Membership.xlsx -> Flexible Membership Worksheet
 * 
 * Data Flow:
 * Employee UI -> membershipService -> excelService -> Membership.xlsx [Both Worksheets]
 */

import { excelService } from "./excelService";
import { EXCEL_WORKSHEETS } from "@/types/excel";
import { MembershipRecord } from "@/types/membership";
import { FlexibleMembershipRecord } from "@/types/flexible-membership";
import { BranchRecordMeta } from "@/types/branch";

export class MembershipService {
  // Master Workbook: Membership.xlsx
  // Worksheet 1: Membership
  private readonly regularWorkbook = EXCEL_WORKSHEETS.MEMBERSHIP.workbook;
  private readonly regularWorksheet = EXCEL_WORKSHEETS.MEMBERSHIP.worksheet;

  // Worksheet 2: Flexible Membership
  private readonly flexibleWorkbook = EXCEL_WORKSHEETS.FLEXIBLE_MEMBERSHIP.workbook;
  private readonly flexibleWorksheet = EXCEL_WORKSHEETS.FLEXIBLE_MEMBERSHIP.worksheet;

  // ==========================================================================
  // 1. Regular Club Membership - Worksheet 1
  // ==========================================================================

  getSnapshot(branchId?: string): MembershipRecord[] {
    const records = excelService.getWorksheetSnapshot<MembershipRecord>(
      this.regularWorkbook,
      this.regularWorksheet
    );
    if (branchId) {
      return records.filter((r) => r.branchId === branchId);
    }
    return records;
  }

  async getAll(branchId?: string): Promise<MembershipRecord[]> {
    const all = await excelService.readWorksheet<MembershipRecord>(
      this.regularWorkbook,
      this.regularWorksheet
    );
    if (branchId) {
      return all.filter((r) => r.branchId === branchId);
    }
    return all;
  }

  async getById(id: string): Promise<MembershipRecord | null> {
    return excelService.readRecordById<MembershipRecord>(
      this.regularWorkbook,
      this.regularWorksheet,
      id
    );
  }

  async search(query: string, branchId?: string): Promise<MembershipRecord[]> {
    const cleanPhone = query.trim().replace(/\D/g, "");
    const cleanText = query.trim().toLowerCase();
    return excelService.queryWorksheet<MembershipRecord>(
      this.regularWorkbook,
      this.regularWorksheet,
      (item) => {
        if (branchId && item.branchId !== branchId) return false;
        if (!cleanText) return true;
        const phone = item.primaryMobileNumber.replace(/\D/g, "");
        const hasLinkedMatch = item.additionalMembers.some(
          (m) =>
            m.name.toLowerCase().includes(cleanText) ||
            m.mobileNumber.replace(/\D/g, "").includes(cleanPhone)
        );
        return (
          phone.includes(cleanPhone) ||
          item.primaryMemberName.toLowerCase().includes(cleanText) ||
          hasLinkedMatch ||
          item.serialNumber?.toString() === query.trim()
        );
      }
    );
  }

  /**
   * Create New Membership:
   * Assigns auto-generated, read-only, permanent Serial Number (never reused).
   */
  async create(
    data: Omit<
      MembershipRecord,
      | "id"
      | "recordId"
      | "serialNumber"
      | "membershipId"
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
  ): Promise<MembershipRecord> {
    const timestamp = new Date().toISOString();
    const allMembers = await this.getAll();
    
    // Auto-generate permanent Serial Number
    const maxSerial = allMembers.reduce(
      (max, m) => Math.max(max, m.serialNumber || 0),
      0
    );
    const serialNumber = maxSerial + 1;
    const formattedId = `MEM-2026-${String(serialNumber).padStart(3, "0")}`;
    const id = `mem-${Date.now()}`;

    const newRecord: MembershipRecord = {
      ...data,
      id,
      recordId: id,
      serialNumber,
      membershipId: formattedId,
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

    return excelService.writeRecord<MembershipRecord>(
      this.regularWorkbook,
      this.regularWorksheet,
      newRecord
    );
  }

  /**
   * Update existing membership
   */
  async update(
    id: string,
    updates: Partial<MembershipRecord>,
    modifierEmployeeId: string
  ): Promise<MembershipRecord> {
    return excelService.updateRecord<MembershipRecord>(
      this.regularWorkbook,
      this.regularWorksheet,
      id,
      updates,
      modifierEmployeeId
    );
  }

  /**
   * Renew Membership:
   * Preserves the exact same Serial Number forever!
   * Updates plan, expiry date, paid amount, and payment method on existing record.
   */
  async renewMembership(
    id: string,
    renewData: {
      membershipPlan: "1 Month" | "3 Months" | "6 Months" | string;
      expiryDate: string;
      amountPaid: number;
      paymentMethod: "Cash" | "UPI";
      remarks?: string;
    },
    modifierEmployeeId: string
  ): Promise<MembershipRecord> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Membership record ${id} not found for renewal.`);
    }

    // Keep same serialNumber!
    const updates: Partial<MembershipRecord> = {
      membershipPlan: renewData.membershipPlan,
      expiryDate: renewData.expiryDate,
      amountPaid: renewData.amountPaid,
      paymentMethod: renewData.paymentMethod,
      dueAmount: Math.max(0, existing.monthlyFee - renewData.amountPaid),
      paymentStatus: renewData.amountPaid >= existing.monthlyFee ? "Paid" : "Partial",
      status: "Active",
      remarks: renewData.remarks
        ? `${existing.remarks ? existing.remarks + "; " : ""}Renewed: ${renewData.remarks}`
        : existing.remarks,
    };

    return this.update(id, updates, modifierEmployeeId);
  }

  async delete(id: string): Promise<boolean> {
    return excelService.deleteRecord(
      this.regularWorkbook,
      this.regularWorksheet,
      id
    );
  }

  // ==========================================================================
  // 2. Flexible Membership - Worksheet 2
  // ==========================================================================

  getSnapshotFlexible(branchId?: string): FlexibleMembershipRecord[] {
    const records = excelService.getWorksheetSnapshot<FlexibleMembershipRecord>(
      this.flexibleWorkbook,
      this.flexibleWorksheet
    );
    if (branchId) {
      return records.filter((r) => r.branchId === branchId);
    }
    return records;
  }

  async getAllFlexible(branchId?: string): Promise<FlexibleMembershipRecord[]> {
    const all = await excelService.readWorksheet<FlexibleMembershipRecord>(
      this.flexibleWorkbook,
      this.flexibleWorksheet
    );
    if (branchId) {
      return all.filter((r) => r.branchId === branchId);
    }
    return all;
  }

  async getByIdFlexible(id: string): Promise<FlexibleMembershipRecord | null> {
    return excelService.readRecordById<FlexibleMembershipRecord>(
      this.flexibleWorkbook,
      this.flexibleWorksheet,
      id
    );
  }

  async createFlexible(
    data: Omit<
      FlexibleMembershipRecord,
      | "id"
      | "recordId"
      | "serialNumber"
      | "flexibleMembershipId"
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
  ): Promise<FlexibleMembershipRecord> {
    const timestamp = new Date().toISOString();
    const existing = await this.getAllFlexible();
    const maxSerial = existing.reduce(
      (max, f) => Math.max(max, f.serialNumber || 0),
      0
    );
    const serialNumber = maxSerial + 1;
    const formattedId = `FLEX-2026-${String(serialNumber).padStart(3, "0")}`;
    const id = `flex-${Date.now()}`;

    const newRecord: FlexibleMembershipRecord = {
      ...data,
      id,
      recordId: id,
      serialNumber,
      flexibleMembershipId: formattedId,
      branchId: auditMeta.branchId,
      branchName: auditMeta.branchName,
      employeeId: auditMeta.employeeId,
      employeeName: auditMeta.employeeName,
      createdBy: auditMeta.employeeId,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastModifiedBy: auditMeta.employeeId,
    };

    return excelService.writeRecord<FlexibleMembershipRecord>(
      this.flexibleWorkbook,
      this.flexibleWorksheet,
      newRecord
    );
  }

  async updateFlexible(
    id: string,
    updates: Partial<FlexibleMembershipRecord>,
    modifierEmployeeId: string
  ): Promise<FlexibleMembershipRecord> {
    return excelService.updateRecord<FlexibleMembershipRecord>(
      this.flexibleWorkbook,
      this.flexibleWorksheet,
      id,
      updates,
      modifierEmployeeId
    );
  }

  async deleteFlexible(id: string): Promise<boolean> {
    return excelService.deleteRecord(
      this.flexibleWorkbook,
      this.flexibleWorksheet,
      id
    );
  }
}

export const membershipService = new MembershipService();
export default membershipService;

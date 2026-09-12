/**
 * Sales Module Service
 * 
 * Future Excel Mapping:
 * Sales Module -> Sales.xlsx -> Sales Worksheet
 * 
 * Data Flow:
 * Employee UI -> salesService -> excelService -> Sales.xlsx [Sales Worksheet]
 */

import { excelService } from "./excelService";
import { EXCEL_WORKSHEETS } from "@/types/excel";
import { SalesRecord, BranchRecordMeta } from "@/types/branch";

export class SalesService {
  private readonly workbook = EXCEL_WORKSHEETS.SALES.workbook;
  private readonly worksheet = EXCEL_WORKSHEETS.SALES.worksheet;

  /**
   * Synchronous snapshot for instant UI render
   */
  getSnapshot(branchId?: string): SalesRecord[] {
    const records = excelService.getWorksheetSnapshot<SalesRecord>(
      this.workbook,
      this.worksheet
    );
    if (branchId) {
      return records.filter((r) => r.branchId === branchId);
    }
    return records;
  }

  /**
   * Fetch all sales records (filtered by branch if provided)
   */
  async getAll(branchId?: string): Promise<SalesRecord[]> {
    const all = await excelService.readWorksheet<SalesRecord>(
      this.workbook,
      this.worksheet
    );
    if (branchId) {
      return all.filter((r) => r.branchId === branchId);
    }
    return all;
  }

  /**
   * Fetch a single sales record by ID
   */
  async getById(id: string): Promise<SalesRecord | null> {
    return excelService.readRecordById<SalesRecord>(
      this.workbook,
      this.worksheet,
      id
    );
  }

  /**
   * Search sales records by customer name, invoice, or phone
   */
  async search(query: string, branchId?: string): Promise<SalesRecord[]> {
    const cleanQuery = query.trim().toLowerCase();
    return excelService.queryWorksheet<SalesRecord>(
      this.workbook,
      this.worksheet,
      (record) => {
        if (branchId && record.branchId !== branchId) return false;
        if (!cleanQuery) return true;
        return (
          record.customerName.toLowerCase().includes(cleanQuery) ||
          record.invoiceNumber.toLowerCase().includes(cleanQuery) ||
          record.customerMobile.includes(cleanQuery) ||
          record.category.toLowerCase().includes(cleanQuery)
        );
      }
    );
  }

  /**
   * Create a new sales record in Sales.xlsx -> Sales Worksheet.
   * Stamped with hidden metadata: Record ID, Branch ID, Branch Name, Employee ID, Employee Name, Created At, Updated At, Last Modified By.
   */
  async create(
    data: Omit<
      SalesRecord,
      | "id"
      | "recordId"
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
  ): Promise<SalesRecord> {
    const timestamp = new Date().toISOString();
    const count = (await this.getAll(auditMeta.branchId)).length + 1;
    const branchCode = auditMeta.branchName.substring(0, 3).toUpperCase();
    const id = `sale-${Date.now()}`;
    const invoiceNumber = `INV-2026-${branchCode}-${String(count).padStart(3, "0")}`;

    const newRecord: SalesRecord = {
      ...data,
      id,
      recordId: id,
      invoiceNumber,
      branchId: auditMeta.branchId,
      branchName: auditMeta.branchName,
      employeeId: auditMeta.employeeId,
      employeeName: auditMeta.employeeName,
      createdBy: auditMeta.employeeId,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastModifiedBy: auditMeta.employeeId,
    };

    return excelService.writeRecord<SalesRecord>(
      this.workbook,
      this.worksheet,
      newRecord
    );
  }

  /**
   * Update an existing sales record
   */
  async update(
    id: string,
    updates: Partial<SalesRecord>,
    modifierEmployeeId: string
  ): Promise<SalesRecord> {
    return excelService.updateRecord<SalesRecord>(
      this.workbook,
      this.worksheet,
      id,
      updates,
      modifierEmployeeId
    );
  }

  /**
   * Delete a sales record
   */
  async delete(id: string): Promise<boolean> {
    return excelService.deleteRecord(this.workbook, this.worksheet, id);
  }
}

export const salesService = new SalesService();
export default salesService;

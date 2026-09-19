/**
 * Sales Module Service
 * 
 * Master Excel Mapping:
 * Sales Module -> Sales.xlsx -> Sales Worksheet
 * 
 * Single Location Architecture
 */

import { excelService } from "./excelService";
import { EXCEL_WORKSHEETS, EmployeeAuditMeta } from "@/types/excel";
import { SalesRecord } from "@/types/sales";

export class SalesService {
  private readonly workbook = EXCEL_WORKSHEETS.SALES.workbook;
  private readonly worksheet = EXCEL_WORKSHEETS.SALES.worksheet;

  /**
   * Synchronous snapshot for instant UI render
   */
  getSnapshot(): SalesRecord[] {
    return excelService.getWorksheetSnapshot<SalesRecord>(
      this.workbook,
      this.worksheet
    );
  }

  /**
   * Fetch all sales records
   */
  async getAll(): Promise<SalesRecord[]> {
    return excelService.readWorksheet<SalesRecord>(
      this.workbook,
      this.worksheet
    );
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
  async search(query: string): Promise<SalesRecord[]> {
    const cleanQuery = query.trim().toLowerCase();
    return excelService.queryWorksheet<SalesRecord>(
      this.workbook,
      this.worksheet,
      (record) => {
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
   */
  async create(
    data: Omit<
      SalesRecord,
      | "id"
      | "recordId"
      | "invoiceNumber"
      | "employeeId"
      | "employeeName"
      | "createdAt"
      | "updatedAt"
      | "lastModifiedBy"
      | "createdBy"
    >,
    auditMeta: EmployeeAuditMeta
  ): Promise<SalesRecord> {
    const timestamp = new Date().toISOString();
    const count = (await this.getAll()).length + 1;
    const id = `sale-${crypto.randomUUID()}`;
    const invoiceNumber = `INV-2026-${String(count).padStart(4, "0")}`;

    const newRecord: SalesRecord = {
      ...data,
      id,
      recordId: id,
      invoiceNumber,
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

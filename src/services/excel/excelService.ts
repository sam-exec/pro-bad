/**
 * Master Centralized Excel Service Layer
 * 
 * Future Data Flow:
 * Employee UI -> Module Service -> Excel Service Layer -> Excel Workbook
 * 
 * This service manages the 5 Master Excel Workbooks and their respective Worksheets.
 * UI components must NEVER access Excel or this service directly; they communicate
 * solely through their designated module services (salesService, kidsService, etc.).
 * 
 * Later, placeholder methods here can be replaced with actual Excel file operations
 * (via xlsx/exceljs/node:fs) or database operations (Supabase/PostgreSQL) with zero
 * changes to the UI layer.
 */

import { ExcelRecordMeta, EXCEL_WORKBOOKS, EXCEL_WORKSHEETS } from "@/types/excel";
import { INITIAL_SALES_RECORDS } from "@/data/sales-mock";
import { INITIAL_KIDS_STUDENTS } from "@/data/kids-coaching-mock";
import {
  INITIAL_KIDS_1ON1_STUDENTS,
  INITIAL_ADULTS_COACHING_MEMBERS,
  INITIAL_ADULTS_1ON1_MEMBERS,
} from "@/data/coaching-modules-mock";
import { INITIAL_MEMBERSHIP_RECORDS } from "@/data/membership-mock";
import { INITIAL_FLEXIBLE_MEMBERSHIPS } from "@/data/flexible-membership-mock";
import { INITIAL_SUPER_MOMS_RECORDS } from "@/data/super-moms-mock";

type WorksheetKey = `${string}::${string}`;

class ExcelService {
  // In-memory worksheet storage keyed by `${workbookName}::${worksheetName}`
  private store: Map<WorksheetKey, any[]> = new Map();

  constructor() {
    this.seedInitialWorksheets();
  }

  /**
   * Seeds the in-memory master workbooks and worksheets from initial mock datasets.
   * Ensures every record has the standard hidden metadata fields.
   */
  private seedInitialWorksheets() {
    // 1. Sales.xlsx -> Sales
    this.initWorksheet(
      EXCEL_WORKSHEETS.SALES.workbook,
      EXCEL_WORKSHEETS.SALES.worksheet,
      INITIAL_SALES_RECORDS
    );

    // 2. Kids Coaching.xlsx -> Kids Coaching & Kids Coaching 1-1
    this.initWorksheet(
      EXCEL_WORKSHEETS.KIDS_COACHING.workbook,
      EXCEL_WORKSHEETS.KIDS_COACHING.worksheet,
      INITIAL_KIDS_STUDENTS
    );
    this.initWorksheet(
      EXCEL_WORKSHEETS.KIDS_COACHING_1ON1.workbook,
      EXCEL_WORKSHEETS.KIDS_COACHING_1ON1.worksheet,
      INITIAL_KIDS_1ON1_STUDENTS
    );

    // 3. Adults Coaching.xlsx -> Adults Coaching & Adults Coaching 1-1
    this.initWorksheet(
      EXCEL_WORKSHEETS.ADULTS_COACHING.workbook,
      EXCEL_WORKSHEETS.ADULTS_COACHING.worksheet,
      INITIAL_ADULTS_COACHING_MEMBERS
    );
    this.initWorksheet(
      EXCEL_WORKSHEETS.ADULTS_COACHING_1ON1.workbook,
      EXCEL_WORKSHEETS.ADULTS_COACHING_1ON1.worksheet,
      INITIAL_ADULTS_1ON1_MEMBERS
    );

    // 4. Membership.xlsx -> Membership & Flexible Membership
    this.initWorksheet(
      EXCEL_WORKSHEETS.MEMBERSHIP.workbook,
      EXCEL_WORKSHEETS.MEMBERSHIP.worksheet,
      INITIAL_MEMBERSHIP_RECORDS
    );
    this.initWorksheet(
      EXCEL_WORKSHEETS.FLEXIBLE_MEMBERSHIP.workbook,
      EXCEL_WORKSHEETS.FLEXIBLE_MEMBERSHIP.worksheet,
      INITIAL_FLEXIBLE_MEMBERSHIPS
    );

    // 5. Super Moms.xlsx -> Super Moms
    this.initWorksheet(
      EXCEL_WORKSHEETS.SUPER_MOMS.workbook,
      EXCEL_WORKSHEETS.SUPER_MOMS.worksheet,
      INITIAL_SUPER_MOMS_RECORDS
    );
  }

  private getSheetKey(workbook: string, worksheet: string): WorksheetKey {
    return `${workbook}::${worksheet}`;
  }

  private initWorksheet<T extends { id?: string; recordId?: string }>(
    workbook: string,
    worksheet: string,
    initialRows: T[]
  ) {
    const key = this.getSheetKey(workbook, worksheet);
    const normalized = initialRows.map((row) => ({
      ...row,
      recordId: row.recordId || row.id || `rec-${crypto.randomUUID()}`,
    }));
    this.store.set(key, normalized);
  }

  private notifyUpdate() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("excel-data-updated"));
    }
  }

  // --------------------------------------------------------------------------
  // Master Excel Virtualized Operations (Placeholder for future xlsx/DB)
  // --------------------------------------------------------------------------

  /**
   * Reads all rows from a designated workbook worksheet.
   * In future: reads from .xlsx file on server / S3 or PostgreSQL table.
   */
  async readWorksheet<T extends ExcelRecordMeta & { id?: string }>(
    workbook: string,
    worksheet: string
  ): Promise<T[]> {
    const key = this.getSheetKey(workbook, worksheet);
    const rows = (this.store.get(key) || []) as T[];
    const seen = new Set<string>();
    const deduplicated: T[] = [];
    for (const r of rows) {
      const identifier = r.id || r.recordId;
      if (identifier && seen.has(identifier)) continue;
      if (identifier) seen.add(identifier);
      deduplicated.push({ ...r });
    }
    return deduplicated;
  }

  /**
   * Synchronous snapshot accessor for immediate initial UI rendering
   */
  getWorksheetSnapshot<T extends ExcelRecordMeta & { id?: string }>(
    workbook: string,
    worksheet: string
  ): T[] {
    const key = this.getSheetKey(workbook, worksheet);
    const rows = (this.store.get(key) || []) as T[];
    const seen = new Set<string>();
    const deduplicated: T[] = [];
    for (const r of rows) {
      const identifier = r.id || r.recordId;
      if (identifier && seen.has(identifier)) continue;
      if (identifier) seen.add(identifier);
      deduplicated.push({ ...r });
    }
    return deduplicated;
  }

  /**
   * Reads a single record by its recordId or id from a designated worksheet.
   */
  async readRecordById<T extends ExcelRecordMeta>(
    workbook: string,
    worksheet: string,
    id: string
  ): Promise<T | null> {
    const key = this.getSheetKey(workbook, worksheet);
    const rows = (this.store.get(key) || []) as T[];
    const found = rows.find((r) => r.recordId === id || (r as any).id === id);
    return found ? { ...found } : null;
  }

  /**
   * Writes/appends a new record to the designated workbook and worksheet.
   * Auto-assigns permanent recordId, timestamps, and audit actor.
   * In future: appends row to Excel file via exceljs/xlsx.
   */
  async writeRecord<T extends ExcelRecordMeta & { id?: string }>(
    workbook: string,
    worksheet: string,
    record: T
  ): Promise<T> {
    const key = this.getSheetKey(workbook, worksheet);
    const rows = (this.store.get(key) || []) as T[];
    const finalRecordId = record.recordId || record.id || `rec-${crypto.randomUUID()}`;
    const timestamp = new Date().toISOString();

    const completeRecord: T = {
      ...record,
      id: record.id || finalRecordId,
      recordId: finalRecordId,
      createdAt: record.createdAt || timestamp,
      updatedAt: timestamp,
      lastModifiedBy: record.lastModifiedBy || record.employeeId,
    };

    const existingFiltered = rows.filter(
      (r) => (r.id || r.recordId) !== (completeRecord.id || completeRecord.recordId)
    );
    const nextRows = [...existingFiltered, completeRecord];
    this.store.set(key, nextRows);

    // [Future Excel Hook]:
    // await xlsxAdapter.appendRow(workbook, worksheet, completeRecord);
    this.notifyUpdate();
    return { ...completeRecord };
  }

  /**
   * Updates an existing record in the designated workbook and worksheet.
   * Automatically updates `updatedAt` and `lastModifiedBy` hidden metadata.
   * In future: updates row in Excel file or executes UPDATE query.
   */
  async updateRecord<T extends ExcelRecordMeta & { id?: string }>(
    workbook: string,
    worksheet: string,
    id: string,
    updates: Partial<T>,
    modifierEmployeeId?: string
  ): Promise<T> {
    const key = this.getSheetKey(workbook, worksheet);
    const rows = (this.store.get(key) || []) as T[];
    const index = rows.findIndex(
      (r: any) => r.recordId === id || r.id === id
    );

    if (index === -1) {
      throw new Error(
        `Record ${id} not found in ${workbook} [${worksheet}]`
      );
    }

    const current = rows[index];
    const timestamp = new Date().toISOString();

    const updated: T = {
      ...current,
      ...updates,
      updatedAt: timestamp,
      lastModifiedBy: modifierEmployeeId || current.lastModifiedBy,
    };

    const nextRows = rows.map((r, i) => (i === index ? updated : r));
    this.store.set(key, nextRows);

    // [Future Excel Hook]:
    // await xlsxAdapter.updateRow(workbook, worksheet, id, updated);
    this.notifyUpdate();
    return { ...updated };
  }

  /**
   * Deletes a record by its recordId or id from the designated worksheet.
   * In future: removes row from Excel file or executes DELETE query.
   */
  async deleteRecord(
    workbook: string,
    worksheet: string,
    id: string
  ): Promise<boolean> {
    const key = this.getSheetKey(workbook, worksheet);
    const rows = this.store.get(key) || [];
    const initialLen = rows.length;
    const filtered = rows.filter(
      (r: any) => r.recordId !== id && r.id !== id
    );

    if (filtered.length !== initialLen) {
      this.store.set(key, filtered);
      // [Future Excel Hook]:
      // await xlsxAdapter.deleteRow(workbook, worksheet, id);
      this.notifyUpdate();
      return true;
    }
    return false;
  }

  /**
   * Queries records in a worksheet matching a custom predicate.
   */
  async queryWorksheet<T extends ExcelRecordMeta>(
    workbook: string,
    worksheet: string,
    predicate: (item: T) => boolean
  ): Promise<T[]> {
    const all = await this.readWorksheet<T>(workbook, worksheet);
    return all.filter(predicate);
  }
}

// Singleton instance of the Excel service layer
export const excelService = new ExcelService();
export default excelService;

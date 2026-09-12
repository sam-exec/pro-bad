import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportColumn<T = any> {
  header: string;
  key: string;
  formatter?: (row: T) => string | number;
}

/**
 * Format records into array of plain objects matching the column definitions
 */
function prepareData<T>(data: T[], columns: ExportColumn<T>[]): Record<string, any>[] {
  return data.map((row) => {
    const item: Record<string, any> = {};
    columns.forEach((col) => {
      if (col.formatter) {
        item[col.header] = col.formatter(row);
      } else {
        const val = (row as any)[col.key];
        item[col.header] = val !== undefined && val !== null ? val : "";
      }
    });
    return item;
  });
}

/**
 * Generates and downloads an Excel (.xlsx) file
 */
export function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName = "Data"
) {
  if (data.length === 0) {
    alert("No records to export.");
    return;
  }

  const prepared = prepareData(data, columns);
  const worksheet = XLSX.utils.json_to_sheet(prepared);

  // Set column widths based on content length
  const colWidths = columns.map((col) => {
    const headerLen = col.header.length;
    let maxContentLen = headerLen;
    prepared.forEach((row) => {
      const cellVal = String(row[col.header] || "");
      if (cellVal.length > maxContentLen) {
        maxContentLen = cellVal.length;
      }
    });
    return { wch: Math.min(Math.max(maxContentLen + 3, 10), 40) };
  });
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));

  const cleanFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, cleanFilename);
}

/**
 * Generates and downloads a CSV (.csv) file with UTF-8 BOM
 */
export function exportToCsv<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
) {
  if (data.length === 0) {
    alert("No records to export.");
    return;
  }

  const prepared = prepareData(data, columns);
  const worksheet = XLSX.utils.json_to_sheet(prepared);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);

  // Add UTF-8 BOM (\uFEFF) for Excel Unicode compatibility
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const cleanFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a styled PDF (.pdf) document in landscape orientation
 */
export function exportToPdf<T>(
  title: string,
  subtitle: string,
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
) {
  if (data.length === 0) {
    alert("No records to export.");
    return;
  }

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, pageWidth, 22, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("PRO BADMINTON ACADEMY - ENTERPRISE ADMIN", 14, 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(224, 231, 255); // Indigo 100
  doc.text(title, 14, 16);

  // Subtitle / Filter details
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // Slate 600
  const dateStr = new Date().toLocaleString();
  doc.text(`${subtitle}  |  Total Records: ${data.length}  |  Generated: ${dateStr}`, 14, 30);

  // Table Data
  const headers = columns.map((c) => c.header);
  const prepared = prepareData(data, columns);
  const rows = prepared.map((item) => columns.map((col) => String(item[col.header] ?? "")));

  autoTable(doc, {
    startY: 34,
    head: [headers],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "left",
    },
    styles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
      overflow: "linebreak",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14, bottom: 16 },
    didDrawPage: (hookData) => {
      // Footer page numbering
      const str = `Page ${hookData.pageNumber}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, pageWidth - 24, doc.internal.pageSize.getHeight() - 8);
    },
  });

  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  doc.save(cleanFilename);
}

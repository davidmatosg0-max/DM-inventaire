import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

type CellValue = string | number | boolean | Date | null | undefined;
type JsonRow = Record<string, CellValue>;

export interface JsonSheetConfig {
  name: string;
  data: JsonRow[];
}

export interface RowSheetConfig {
  name: string;
  rows: CellValue[][];
}

function sanitizeSheetName(name: string): string {
  const sanitized = name.replace(/[\\/*?:\[\]]/g, ' ').trim();
  return sanitized.slice(0, 31) || 'Sheet';
}

function normalizeFileName(filename: string): string {
  return filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
}

function clampWidth(length: number): number {
  return Math.min(Math.max(length + 2, 10), 60);
}

function getCellLength(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'object' && value && 'richText' in value) {
    const richText = (value as { richText?: Array<{ text?: string }> }).richText ?? [];
    return richText.map((item) => item.text ?? '').join('').length;
  }

  return String(value).length;
}

function autoFitColumns(worksheet: ExcelJS.Worksheet) {
  worksheet.columns.forEach((column) => {
    let maxLength = 0;

    column.eachCell({ includeEmpty: true }, (cell) => {
      maxLength = Math.max(maxLength, getCellLength(cell.value));
    });

    column.width = clampWidth(maxLength);
  });
}

function addRowSheet(workbook: ExcelJS.Workbook, { name, rows }: RowSheetConfig) {
  const worksheet = workbook.addWorksheet(sanitizeSheetName(name));

  rows.forEach((row) => {
    worksheet.addRow(row);
  });

  autoFitColumns(worksheet);
  return worksheet;
}

export function createWorkbookFromJsonSheets(sheets: JsonSheetConfig[]): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();

  sheets.forEach(({ name, data }) => {
    if (data.length === 0) {
      addRowSheet(workbook, { name, rows: [['Sin datos']] });
      return;
    }

    const headers = Array.from(
      data.reduce((keys, row) => {
        Object.keys(row).forEach((key) => keys.add(key));
        return keys;
      }, new Set<string>())
    );

    const rows: CellValue[][] = [
      headers,
      ...data.map((row) => headers.map((header) => row[header] ?? '')),
    ];

    addRowSheet(workbook, { name, rows });
  });

  return workbook;
}

export function createWorkbookFromRowSheets(sheets: RowSheetConfig[]): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();

  sheets.forEach((sheet) => {
    addRowSheet(workbook, sheet);
  });

  return workbook;
}

export async function saveWorkbook(workbook: ExcelJS.Workbook, filename: string): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, normalizeFileName(filename));
}
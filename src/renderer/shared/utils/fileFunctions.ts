import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { TFunction } from 'i18next';
import type { Columns, Row, Rows, RowValue } from '../types/excel';

export const exportExcel = async (columns: Columns, rows: Rows, fileName = 'export.xlsx') => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sheet1');

  sheet.addRow(columns);

  for (const row of rows) {
    const processedRow: RowValue[] = [];

    for (const col of columns) {
      const value = row[col];

      // Leaving logos column out of excel
      // if (value instanceof Uint8Array) {
      //   processedRow.push(await uint8ArrayToDataUrl(value));
      // } else {
      //   processedRow.push(value);
      // }

      processedRow.push(value);
    }

    sheet.addRow(processedRow);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), fileName);
};

export const importExcel = async (
  t: TFunction<'translation', undefined>,
  file: File
): Promise<{ columns: Columns; rows: Rows }> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error(t('error.noWorksheetFound'));

  const headerRow = sheet.getRow(1);
  if (!headerRow || !headerRow.hasValues) {
    throw new Error(t('error.headerRowEmpty'));
  }

  const headerValuesArray = Array.isArray(headerRow.values) ? headerRow.values : Object.values(headerRow.values);
  const columns: Columns = headerValuesArray.slice(1).map(v => String(v ?? ''));

  const rows: Rows = [];

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const rowData: Row = {} as Row;
    columns.forEach((col, i) => {
      const cellValue = row.getCell(i + 1).value as RowValue;

      // Leaving logos column out of excel
      // if (isDataUrl(cellValue)) {
      //   rowData[col] = dataUrlToBlob(cellValue);
      // } else {
      //   rowData[col] = cellValue;
      // }

      rowData[col] = cellValue;
    });
    rows.push(rowData);
  });

  return { columns, rows };
};

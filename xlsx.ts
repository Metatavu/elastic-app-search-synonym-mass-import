// @deno-types="https://cdn.sheetjs.com/xlsx-0.19.1/package/types/index.d.ts"
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.19.1/package/xlsx.mjs";
import * as cptable from "https://cdn.sheetjs.com/xlsx-latest/package/dist/cpexcel.full.mjs";

XLSX.set_cptable(cptable);

/**
 * Parses individual values from given cell value
 *
 * @param cell cell
 */
const parseValuesFromCell = (cell: string) => cell
  .replaceAll("...", "")
  .split(",")
  .map(value => value.trim());

/**
 * Returns list with unique values from given list
 *
 * @param list list
 */
const unique = (list: string[]) => [ ...new Set(list) ];

/**
 * Returns JSON data from XLSX file in given file path
 *
 * @param filePath file path
 */
export const parseSynonymsFromXlsxFile = (filePath: string): string[][] => {
  const workbook = XLSX.readFile(filePath);

  if (!workbook.SheetNames.length) throw Error("No data sheet in file");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw Error("No data sheet in file");

  const allRrows = XLSX.utils.sheet_to_json<string[]>(sheet, { blankrows: false, header: 1 });

  const rows = allRrows
    .slice(2)
    .filter(row => row.every(cell => !cell.includes("(none)")));

  const synonymSets = rows.map(row => {
    return row.reduce<string[]>((list, cell) => {
      const values = parseValuesFromCell(cell);
      list.push(...unique(values));
      return list;
    }, []);
  });

  return synonymSets;
};
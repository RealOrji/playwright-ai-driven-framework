/**
 * Links the manual test cases in test-cases/test-cases.xlsx to the automated Playwright specs.
 * A test case counts as automated when a spec carries its ID as a tag, e.g. `@TC-AUTH-001`.
 *
 * Usage:
 *   node scripts/traceability.mts           Print the coverage report
 *   node scripts/traceability.mts --update  Also write the automation status back to the workbook
 */
import { globSync, readFileSync } from 'node:fs';
import ExcelJS from 'exceljs';

const WORKBOOK_PATH = 'test-cases/test-cases.xlsx';
const SHEET_NAME = 'Test Cases';
const SPEC_PATTERN = 'tests/**/*.spec.ts';
const TAG_PATTERN = /@(TC-[A-Z]+-\d{3})\b/g;

const Column = {
  id: 'Test Case ID',
  title: 'Title',
  priority: 'Priority',
  status: 'Automation Status',
  automatedIn: 'Automated In',
} as const;

interface TestCase {
  row: number;
  id: string;
  title: string;
  priority: string;
}

/** Maps each test case ID tagged in the specs to the spec files that reference it. */
const collectSpecTags = (): Map<string, string[]> => {
  const tags = new Map<string, string[]>();

  for (const file of globSync(SPEC_PATTERN).sort()) {
    const ids = new Set(
      Array.from(readFileSync(file, 'utf8').matchAll(TAG_PATTERN), ([, id]) => id),
    );
    ids.forEach((id) => tags.set(id, [...(tags.get(id) ?? []), file]));
  }
  return tags;
};

type Columns = Record<keyof typeof Column, number>;

/** Resolves each required header to its column number, failing fast if one is missing. */
const headerColumns = (sheet: ExcelJS.Worksheet): Columns => {
  const found = new Map<string, number>();
  sheet.getRow(1).eachCell((cell, col) => found.set(cell.text.trim(), col));

  const missing = Object.values(Column).filter((header) => !found.has(header));
  if (missing.length) throw new Error(`Missing columns in "${SHEET_NAME}": ${missing.join(', ')}`);

  return Object.fromEntries(
    Object.entries(Column).map(([key, header]) => [key, found.get(header)]),
  ) as Columns;
};

const readTestCases = (sheet: ExcelJS.Worksheet, columns: Columns): TestCase[] => {
  const testCases: TestCase[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const text = (column: number) => row.getCell(column).text.trim();
    const id = text(columns.id);
    if (id) {
      testCases.push({
        row: rowNumber,
        id,
        title: text(columns.title),
        priority: text(columns.priority),
      });
    }
  });
  return testCases;
};

const findDuplicates = (ids: string[]): string[] => [
  ...new Set(ids.filter((id, index) => ids.indexOf(id) !== index)),
];

const main = async (): Promise<void> => {
  const shouldUpdate = process.argv.includes('--update');

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(WORKBOOK_PATH);
  const sheet = workbook.getWorksheet(SHEET_NAME);
  if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found in ${WORKBOOK_PATH}`);

  const columns = headerColumns(sheet);
  const testCases = readTestCases(sheet, columns);
  const specTags = collectSpecTags();

  const report = testCases.map(({ id, title, priority }) => {
    const specs = specTags.get(id) ?? [];
    return {
      ID: id,
      Title: title,
      Priority: priority,
      Status: specs.length ? 'Automated' : 'Manual',
      'Automated In': specs.join(', '),
    };
  });
  console.table(report);

  const automated = report.filter(({ Status }) => Status === 'Automated').length;
  const coverage = testCases.length ? Math.round((automated / testCases.length) * 100) : 0;
  console.log(`Automation coverage: ${automated}/${testCases.length} test cases (${coverage}%)`);

  const knownIds = new Set(testCases.map(({ id }) => id));
  const unknownTags = [...specTags].filter(([id]) => !knownIds.has(id));
  const duplicateIds = findDuplicates(testCases.map(({ id }) => id));

  if (unknownTags.length) {
    console.error(`\nTags with no matching test case in ${WORKBOOK_PATH}:`);
    unknownTags.forEach(([id, specs]) => console.error(`  @${id} -> ${specs.join(', ')}`));
  }
  if (duplicateIds.length) {
    console.error(`\nDuplicate test case IDs in ${WORKBOOK_PATH}: ${duplicateIds.join(', ')}`);
  }

  if (shouldUpdate) {
    testCases.forEach(({ row }, index) => {
      const sheetRow = sheet.getRow(row);
      sheetRow.getCell(columns.status).value = report[index].Status;
      sheetRow.getCell(columns.automatedIn).value = report[index]['Automated In'];
    });
    await workbook.xlsx.writeFile(WORKBOOK_PATH);
    console.log(`Updated automation status in ${WORKBOOK_PATH}`);
  }

  if (unknownTags.length || duplicateIds.length) process.exitCode = 1;
};

await main();

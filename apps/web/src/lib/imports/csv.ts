export type CsvCustomerRow = {
  name: string;
  phone: string;
  email?: string | null;
  visitDate?: string | null;
  location?: string | null;
};

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function mapHeaderToField(header: string): keyof CsvCustomerRow | null {
  const key = normalizeHeader(header);
  if (key === "name") return "name";
  if (key === "phone" || key === "phonenumber" || key === "phonee164") return "phone";
  if (key === "email") return "email";
  if (key === "visitdate" || key === "lastvisitdate") return "visitDate";
  if (key === "location") return "location";
  return null;
}

export function parseCustomerCsv(text: string): { rows: CsvCustomerRow[]; errors: string[] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const errors: string[] = [];

  if (lines.length < 2) {
    return { rows: [], errors: ["CSV must include a header row and at least one data row"] };
  }

  const headers = parseCsvLine(lines[0]);
  const fieldIndexes = headers.map((header) => mapHeaderToField(header));

  if (!fieldIndexes.includes("name") || !fieldIndexes.includes("phone")) {
    return { rows: [], errors: ["CSV must include Name and Phone columns"] };
  }

  const rows: CsvCustomerRow[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const values = parseCsvLine(lines[lineIndex]);
    const row: CsvCustomerRow = { name: "", phone: "" };

    fieldIndexes.forEach((field, columnIndex) => {
      if (!field) return;
      const value = values[columnIndex]?.trim() ?? "";
      if (field === "email" || field === "visitDate" || field === "location") {
        row[field] = value || null;
      } else {
        row[field] = value;
      }
    });

    if (!row.name || !row.phone) {
      errors.push(`Row ${lineIndex + 1}: missing name or phone`);
      continue;
    }

    rows.push(row);
  }

  return { rows, errors };
}

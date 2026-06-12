/**
 * Dependency-free CSV helpers for the dashboard import/export. Pure functions,
 * safe to import from client components.
 *
 * parseCsv handles the RFC-4180 cases a Google Contacts / Mailchimp export
 * produces: quoted fields, `""` escapes, commas and newlines inside quotes,
 * CRLF or LF line endings, and a UTF-8 BOM.
 */

export function parseCsv(text: string): string[][] {
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text; // strip BOM
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && input[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }

  // Flush the last field/row when the file doesn't end with a newline.
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop fully-empty rows (trailing blank lines are common in exports).
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

export type ColumnMap = {
  email: number;
  firstName: number;
  lastName: number;
  fullName: number;
  phone: number;
};

/**
 * Guess which column is which from the header row (-1 = not found). Tuned for
 * Google Contacts and Mailchimp exports; the import UI lets the user override
 * every guess before anything is sent.
 */
export function autoMapColumns(header: string[]): ColumnMap {
  const find = (patterns: RegExp[]): number =>
    header.findIndex((cell) => patterns.some((p) => p.test(cell.trim())));

  const firstName = find([/^first\s*name$/i, /first|given/i]);
  const lastName = find([/^last\s*name$/i, /last|family|surname/i]);

  return {
    email: find([/^e-?mail/i, /e-?mail/i]),
    firstName,
    lastName,
    // Only treat a bare "Name" column as full name when first/last are absent.
    fullName: firstName === -1 && lastName === -1 ? find([/^(full\s*)?name$/i]) : -1,
    phone: find([/phone|mobile|cell|number/i])
  };
}

/** Split "Jane van Dyke" → { firstName: "Jane", lastName: "van Dyke" }. */
export function splitFullName(full: string): { firstName: string; lastName: string } {
  const trimmed = full.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { firstName: '', lastName: '' };
  const space = trimmed.indexOf(' ');
  if (space === -1) return { firstName: trimmed, lastName: '' };
  return { firstName: trimmed.slice(0, space), lastName: trimmed.slice(space + 1) };
}

export function toCsv(rows: string[][]): string {
  const escape = (cell: string) =>
    /[",\n\r]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
  return rows.map((row) => row.map(escape).join(',')).join('\r\n');
}

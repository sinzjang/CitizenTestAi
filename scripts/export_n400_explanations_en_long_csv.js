// Export English explanations from n400_explanations.json to long CSV format
// Columns: KEY, DataName, Value
// Output: data/n400_explanations_en_long.csv

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'data', 'n400_explanations.json');
const OUT = path.join(__dirname, '..', 'data', 'n400_explanations_en_long.csv');

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const s = String(value).replace(/\r?\n/g, ' ');
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function main() {
  const raw = fs.readFileSync(SRC, 'utf-8');
  const json = JSON.parse(raw);

  const rows = [];
  // header
  rows.push(['KEY', 'DataName', 'Value']);

  // sort keys: idx_* first in numeric order, then others alphabetically
  const keys = Object.keys(json).sort((a, b) => {
    const idxA = a.startsWith('idx_') ? parseInt(a.slice(4), 10) : Infinity;
    const idxB = b.startsWith('idx_') ? parseInt(b.slice(4), 10) : Infinity;
    if (Number.isFinite(idxA) && Number.isFinite(idxB)) return idxA - idxB;
    if (Number.isFinite(idxA)) return -1;
    if (Number.isFinite(idxB)) return 1;
    return a.localeCompare(b);
  });

  for (const k of keys) {
    const entry = json[k];
    if (!entry || !entry.en) continue;
    const { title, intent, answer_guidance } = entry.en;
    if (title !== undefined) rows.push([k, 'title_en', title]);
    if (intent !== undefined) rows.push([k, 'intent_en', intent]);
    if (answer_guidance !== undefined) rows.push([k, 'answer_guidance_en', answer_guidance]);
  }

  const csv = rows.map(cols => cols.map(csvEscape).join(',')).join('\n');
  fs.writeFileSync(OUT, csv, 'utf-8');
  console.log(`Wrote ${rows.length - 1} lines (data rows) to ${OUT}`);
}

main();

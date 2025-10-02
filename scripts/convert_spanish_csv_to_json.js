#!/usr/bin/env node
/*
  Convert Spanish interview CSV (long format: ID,DataName,es) into JSON matching data/interview_questions_en.json schema.
  Output: data/interview_questions_es.json

  Expected DataName patterns per ID:
    - Question
    - Correct_Answer_<n>
    - Correct_Rationale_<n>
    - Wrong_Answer_<n>
    - Wrong_Rationale_<n>
*/

const fs = require('fs');
const path = require('path');

const DEFAULT_CSV_PATH = path.join(__dirname, '..', 'data', 'interview_questions_es.csv');
const DEFAULT_OUT_PATH = path.join(__dirname, '..', 'data', 'interview_questions_es.json');

function parseCsvLine(line) {
  // Basic CSV parser handling quotes and commas
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result.map(v => v.replace(/\r?\n/g, '\n'));
}

function toIntSafe(v) {
  const n = parseInt(String(v).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

function ensureAnswerSlot(arr, index) {
  while (arr.length <= index) arr.push({});
}

function main() {
  // Allow overriding input/output via CLI args
  // Usage: node convert_spanish_csv_to_json.js [input_csv] [output_json]
  const CSV_PATH = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : DEFAULT_CSV_PATH;
  const OUT_PATH = process.argv[3]
    ? path.resolve(process.cwd(), process.argv[3])
    : DEFAULT_OUT_PATH;
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV not found: ${CSV_PATH}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  // Support CRLF, LF, or CR-only line endings
  const lines = raw.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
  if (lines.length === 0) {
    console.error('CSV is empty.');
    process.exit(1);
  }

  // First line may be a header or a data row; detect header by exact match or by non-numeric first column
  const header = parseCsvLine(lines[0]).map(s => s.trim());
  let startIdx = 0;
  if (
    header.length >= 2 &&
    ((header[0] && header[0].toLowerCase() === 'id') || toIntSafe(header[0]) === null)
  ) {
    startIdx = 1;
  }

  /** @type {Record<number, {id:number, question?:string, correctAnswers: Array<{text?:string, rationale?:string}>, wrongAnswers: Array<{text?:string, rationale?:string}>}>} */
  const byId = {};

  for (let i = startIdx; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 3) continue;
    const [idRaw, dataNameRaw, valueRaw] = cols;
    const id = toIntSafe(idRaw);
    if (!id) continue;
    const dataName = (dataNameRaw || '').trim();
    const value = (valueRaw || '').trim();

    if (!byId[id]) byId[id] = { id, correctAnswers: [], wrongAnswers: [] };
    const item = byId[id];

    if (dataName.toLowerCase() === 'question') {
      item.question = value;
      continue;
    }

    // Match patterns like Correct_Answer_1, Correct_Rationale_1, Wrong_Answer_2, Wrong_Rationale_2
    const m = /^(Correct|Wrong)_(Answer|Rationale)_(\d+)$/.exec(dataName);
    if (!m) {
      // Unknown key, ignore
      continue;
    }
    const kind = m[1]; // Correct or Wrong
    const field = m[2]; // Answer or Rationale
    const idx = parseInt(m[3], 10) - 1; // zero-based index

    const targetArr = kind === 'Correct' ? item.correctAnswers : item.wrongAnswers;
    ensureAnswerSlot(targetArr, idx);

    if (field === 'Answer') targetArr[idx].text = value;
    else if (field === 'Rationale') targetArr[idx].rationale = value;
  }

  // Transform to final array and sort by id
  const out = Object.values(byId)
    .sort((a, b) => a.id - b.id)
    .map(q => ({
      id: q.id,
      question: q.question || '',
      correctAnswers: q.correctAnswers
        .filter(a => (a.text && a.text.trim().length > 0))
        .map(a => ({ text: a.text.trim(), rationale: (a.rationale || '').trim() })),
      wrongAnswers: q.wrongAnswers
        .filter(a => (a.text && a.text.trim().length > 0))
        .map(a => ({ text: a.text.trim(), rationale: (a.rationale || '').trim() })),
    }));

  // Simple validation: ensure keys match English schema
  const hasBad = out.some(q => typeof q.id !== 'number' || typeof q.question !== 'string' || !Array.isArray(q.correctAnswers) || !Array.isArray(q.wrongAnswers));
  if (hasBad) {
    console.error('Output failed schema sanity check.');
    process.exit(1);
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log(`Wrote ${out.length} questions to ${OUT_PATH}`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('Error converting CSV to JSON:', err);
    process.exit(1);
  }
}

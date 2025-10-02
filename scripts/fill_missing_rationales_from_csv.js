#!/usr/bin/env node
/*
Fill only empty rationale fields for specific IDs by reading the language-specific missing CSV
and matching correctAnswers[].text to Correct_Answer_N entries to copy over Correct_Rationale_N.

Usage:
  node scripts/fill_missing_rationales_from_csv.js <lang>
Where <lang> in [en, es, fr, zh, tl, vi, hi, ar, ko]
*/

const fs = require('fs');
const path = require('path');

const IDS = new Set([59, 73, 91, 92, 93]);

function normalizeText(s) {
  if (typeof s !== 'string') return '';
  // Normalize unicode, remove diacritics where applicable, lowercase, trim, collapse spaces, remove surrounding quotes
  const n = s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // diacritics
    .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"')
    .toLowerCase();
  // Keep letters/numbers from all scripts; remove most punctuation except intra-word
  const stripped = n.replace(/\s+/g, ' ').trim();
  return stripped;
}

function parseCSV(content) {
  // RFC4180-ish CSV parser that supports quoted fields and commas/newlines inside quotes
  const rows = [];
  let i = 0;
  const n = content.length;
  let field = '';
  let row = [];
  let inQuotes = false;
  while (i < n) {
    const ch = content[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < n && content[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += ch;
        i++;
        continue;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (ch === ',') {
        row.push(field);
        field = '';
        i++;
        continue;
      }
      if (ch === '\n' || ch === '\r') {
        // handle CRLF/CR
        // finalize row only if there's data or we've started collecting
        // consume \r\n as one
        if (ch === '\r' && i + 1 < n && content[i + 1] === '\n') i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i++;
        continue;
      }
      field += ch;
      i++;
    }
  }
  // last field
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function buildAnswerToRationaleMap(csvRows) {
  // Expect header row: ID,DataName,Value,...
  const header = csvRows[0] || [];
  const idIdx = header.findIndex(h => h.trim().toLowerCase() === 'id');
  const dataNameIdx = header.findIndex(h => h.trim().toLowerCase() === 'dataname');
  // Value may be exactly 'Value' or localized; take column index 2 as fallback
  let valueIdx = header.findIndex(h => h.trim().toLowerCase() === 'value');
  if (valueIdx === -1) valueIdx = 2; // as observed in en CSV

  // For each ID, create map: answer text -> rationale
  const mapsById = new Map();

  // First pass: gather Correct_Answer_N values per ID and N
  const answersById = new Map(); // id -> { N -> text }
  for (let r = 1; r < csvRows.length; r++) {
    const row = csvRows[r];
    if (!row || row.length === 0) continue;
    const idRaw = row[idIdx] || '';
    const id = parseInt(idRaw, 10);
    if (!IDS.has(id)) continue;
    const dataName = (row[dataNameIdx] || '').trim();
    const value = (row[valueIdx] || '').trim();
    const mAns = dataName.match(/^Correct_Answer_(\d+)$/i);
    if (mAns) {
      const N = parseInt(mAns[1], 10);
      if (!answersById.has(id)) answersById.set(id, new Map());
      answersById.get(id).set(N, value);
    }
  }

  // Second pass: map rationale by matching N
  const rationaleById = new Map(); // id -> { N -> rationale }
  for (let r = 1; r < csvRows.length; r++) {
    const row = csvRows[r];
    const idRaw = row[idIdx] || '';
    const id = parseInt(idRaw, 10);
    if (!IDS.has(id)) continue;
    const dataName = (row[dataNameIdx] || '').trim();
    const value = (row[valueIdx] || '').trim();
    const mRat = dataName.match(/^Correct_Rationale_(\d+)$/i);
    if (mRat) {
      const N = parseInt(mRat[1], 10);
      if (!rationaleById.has(id)) rationaleById.set(id, new Map());
      rationaleById.get(id).set(N, value);
    }
  }

  // Build answer text -> rationale mapping per ID
  // Also keep ordered arrays for index-based fallback mapping
  const orderById = new Map(); // id -> array of {text, rationale} in N order
  for (const [id, ansMap] of answersById.entries()) {
    const ratMap = rationaleById.get(id) || new Map();
    const byAnswer = new Map();
    const ordered = [];
    // sort by N
    const entries = [...ansMap.entries()].sort((a,b)=>a[0]-b[0]);
    for (const [N, text] of entries) {
      const rat = ratMap.get(N);
      if (text) byAnswer.set(text, rat || '');
      ordered.push({ text, rationale: rat || '' });
    }
    mapsById.set(id, byAnswer);
    orderById.set(id, ordered);
  }

  return { mapsById, orderById };
}

function main() {
  const lang = process.argv[2];
  if (!lang) {
    console.error('Usage: node scripts/fill_missing_rationales_from_csv.js <lang>');
    process.exit(1);
  }
  const dataDir = path.resolve(__dirname, '..', 'data');
  const jsonPath = path.join(dataDir, `interview_questions_${lang}.json`);
  const csvPath = path.join(dataDir, `interview_questions_missing_${lang}.csv`);

  if (!fs.existsSync(jsonPath)) {
    console.error(`JSON not found: ${jsonPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(csvContent);
  if (!rows || rows.length === 0) {
    console.error('CSV parse produced no rows');
    process.exit(1);
  }
  const { mapsById, orderById } = buildAnswerToRationaleMap(rows);

  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let updated = 0;

  for (let i = 0; i < json.length; i++) {
    const q = json[i];
    if (!IDS.has(q.id)) continue;
    const map = mapsById.get(q.id);
    if (!map) continue; // nothing to fill from CSV for this ID
    if (!Array.isArray(q.correctAnswers)) continue;

    // Precompute normalized lookup maps for stronger matching
    const normMap = new Map(); // norm(answer) -> rationale
    for (const [text, rat] of map.entries()) {
      normMap.set(normalizeText(text), rat);
    }
    const ordered = orderById.get(q.id) || [];

    for (let idx = 0; idx < q.correctAnswers.length; idx++) {
      const ans = q.correctAnswers[idx];
      if (typeof ans.rationale === 'string' && ans.rationale.trim() === '') {
        let csvRat = map.get(ans.text);
        if (!(typeof csvRat === 'string' && csvRat.trim() !== '')) {
          const key = normalizeText(ans.text);
          const ratNorm = normMap.get(key);
          if (typeof ratNorm === 'string' && ratNorm.trim() !== '') {
            csvRat = ratNorm;
          } else {
            // fallback: try contains matching among keys
            for (const [k, r] of normMap.entries()) {
              if (!r || r.trim() === '') continue;
              if (key.includes(k) || k.includes(key)) {
                csvRat = r;
                break;
              }
            }
            // final fallback: index-based mapping if lengths align
            if (!(typeof csvRat === 'string' && csvRat.trim() !== '')) {
              if (ordered.length === q.correctAnswers.length) {
                const byIndex = ordered[idx] && ordered[idx].rationale;
                if (typeof byIndex === 'string' && byIndex.trim() !== '') {
                  csvRat = byIndex;
                }
              }
            }
          }
        }
        if (typeof csvRat === 'string' && csvRat.trim() !== '') {
          ans.rationale = csvRat;
          updated++;
        }
      }
    }
  }

  if (updated > 0) {
    // backup
    const backupPath = jsonPath + '.bak';
    try { fs.copyFileSync(jsonPath, backupPath); } catch {}
    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
  }
  console.log(`${lang}: updated rationales = ${updated}`);
}

main();

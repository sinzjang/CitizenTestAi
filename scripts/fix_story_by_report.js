#!/usr/bin/env node
/*
  Read scripts/story_structure_report.txt and fix only the listed sections by
  aligning content_<lang> to match content_en length and type sequence.
*/

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const storyPath = path.resolve(projectRoot, 'data', 'question_story.json');
const reportPath = path.resolve(__dirname, 'story_structure_report.txt');

function parseReportLine(line) {
  // Example: chapter 1 section 0: content_es length 13 != content_en length 11
  const m = line.match(/chapter\s+(\d+)\s+section\s+(\d+):\s+(content_(\w+))\s+length\s+(\d+)\s+!=\s+content_en\s+length\s+(\d+)/);
  if (!m) return null;
  return {
    chapterId: parseInt(m[1], 10),
    sectionIndex: parseInt(m[2], 10),
    key: m[3],
    lang: m[4],
    curLen: parseInt(m[5], 10),
    targetLen: parseInt(m[6], 10),
  };
}

function splitAnswerOnCommas(item) {
  if (!item || item.type !== 'answer') return [item];
  const parts = String(item.text || '').split(/,(?![^()]*\))/g).map(s => s.trim()).filter(Boolean);
  if (parts.length <= 1) return [item];
  return parts.map(p => ({ type: 'answer', text: p }));
}

function alignArrayToTemplate(src, template) {
  let arr = Array.isArray(src) ? src.slice() : [];
  const tlen = template.length;

  // Expand answers by comma where possible
  if (arr.length < tlen) {
    const expanded = [];
    for (const it of arr) expanded.push(...splitAnswerOnCommas(it));
    arr = expanded;
  }

  // If longer: merge adjacent greedily
  while (arr.length > tlen && arr.length > 1) {
    // Merge earliest mismatch window
    const i = 0;
    const merged = { type: arr[i].type, text: String(arr[i].text || '') + String(arr[i + 1].text || '') };
    arr.splice(i, 2, merged);
  }

  // Pad if still short
  while (arr.length < tlen) {
    const idx = arr.length;
    arr.push({ type: template[idx].type, text: '' });
  }

  // Coerce to template types
  const out = [];
  for (let i = 0; i < tlen; i++) {
    out.push({ type: template[i].type, text: String(arr[i] && arr[i].text || '') });
  }
  return out;
}

function main() {
  if (!fs.existsSync(reportPath)) {
    console.log('[fix_story_by_report] No report file found, nothing to fix.');
    return;
  }
  const report = fs.readFileSync(reportPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const targets = report.map(parseReportLine).filter(Boolean);
  if (targets.length === 0) {
    console.log('[fix_story_by_report] Report empty or unparsable.');
    return;
  }

  const raw = fs.readFileSync(storyPath, 'utf8');
  const json = JSON.parse(raw);
  const chapters = Array.isArray(json.civicsStory) ? json.civicsStory : [];

  let fixed = 0;
  for (const t of targets) {
    const ch = chapters.find(c => c.chapterId === t.chapterId);
    if (!ch || !Array.isArray(ch.sections) || !ch.sections[t.sectionIndex]) continue;
    const sec = ch.sections[t.sectionIndex];
    const template = Array.isArray(sec.content_en) ? sec.content_en : [];
    if (!Array.isArray(sec[t.key])) continue;

    sec[t.key] = alignArrayToTemplate(sec[t.key], template);
    fixed++;
  }

  if (fixed > 0) {
    fs.writeFileSync(storyPath, JSON.stringify(json, null, 2), 'utf8');
    console.log(`[fix_story_by_report] Fixed sections: ${fixed}`);
  } else {
    console.log('[fix_story_by_report] Nothing fixed.');
  }
}

if (require.main === module) main();

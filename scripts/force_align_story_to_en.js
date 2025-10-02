#!/usr/bin/env node
/*
  Force-align content_ko and content_es arrays to match content_en (length and type sequence).
  Strategy:
  - Iterate template tokens; for each template type, pull from source tokens greedily.
  - Skip trivial punctuation normals (",", " ,", quotes, whitespace) when template expects 'answer'.
  - Coerce resulting token.type to template type and preserve text.
  - Produce exact same length as template. Extra source tokens are dropped; shortages are padded with empty text.
  - Write a debug log per section to scripts/force_align_story_to_en.log
*/

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const storyPath = path.resolve(projectRoot, 'data', 'question_story.json');
const targetLangs = ['ko', 'es'];
const logPath = path.resolve(__dirname, 'force_align_story_to_en.log');

function isTrivialPunctuationNormal(tok) {
  if (!tok || tok.type !== 'normal') return false;
  const t = String(tok.text || '');
  return /^\s*[",'“”‘’،··\.·\-—–:;\(\)\[\]¿¡!?]*\s*$/.test(t) || /^\s*,\s*$/.test(t);
}

function takeNextUseful(src, j, expectedType) {
  // Skip trivial punctuation normals when expecting 'answer'
  while (j < src.length && expectedType === 'answer' && isTrivialPunctuationNormal(src[j])) {
    j++;
  }
  if (j >= src.length) return { item: { type: expectedType, text: '' }, next: j };
  const cur = src[j];
  // If expecting answer and current is normal comma then next is answer, skip comma and take answer
  if (expectedType === 'answer' && isTrivialPunctuationNormal(cur) && src[j + 1] && src[j + 1].type === 'answer') {
    return { item: { type: expectedType, text: String(src[j + 1].text || '') }, next: j + 2 };
  }
  // Otherwise take current
  return { item: { type: expectedType, text: String(cur.text || '') }, next: j + 1 };
}

function forceAlign(src, template) {
  const out = [];
  let j = 0;
  for (let i = 0; i < template.length; i++) {
    const expectedType = template[i].type;
    const { item, next } = takeNextUseful(src, j, expectedType);
    out.push({ type: expectedType, text: item.text });
    j = next;
  }
  return out;
}

function main() {
  const raw = fs.readFileSync(storyPath, 'utf8');
  const json = JSON.parse(raw);
  const chapters = Array.isArray(json.civicsStory) ? json.civicsStory : [];
  const logs = [];
  let changes = 0;

  chapters.forEach((ch, ci) => {
    if (!Array.isArray(ch.sections)) return;
    ch.sections.forEach((sec, si) => {
      const template = Array.isArray(sec.content_en) ? sec.content_en : null;
      if (!template) return;
      targetLangs.forEach((lang) => {
        const key = `content_${lang}`;
        const src = Array.isArray(sec[key]) ? sec[key] : null;
        if (!src) return;
        if (src.length === template.length) return;
        const beforeLen = src.length;
        const beforeTypes = src.map(t => t.type).join(',');
        const aligned = forceAlign(src, template);
        sec[key] = aligned;
        const afterLen = aligned.length;
        const afterTypes = aligned.map(t => t.type).join(',');
        logs.push(`chapter ${ch.chapterId || ci} section ${si} ${key}: ${beforeLen} -> ${afterLen} | ${beforeTypes} -> ${afterTypes}`);
        changes++;
      });
    });
  });

  if (changes > 0) {
    fs.writeFileSync(storyPath, JSON.stringify(json, null, 2), 'utf8');
  }
  try { fs.writeFileSync(logPath, (changes > 0 ? logs.join('\n') : 'No changes') + '\n', 'utf8'); } catch {}
  console.log(`[force_align_story_to_en] Sections updated: ${changes}`);
}

if (require.main === module) {
  main();
}

#!/usr/bin/env node
/*
  Re-scan question_story.json and regenerate a mismatch report comparing content_<lang> to content_en
  for target languages (ko, es). Writes to scripts/story_structure_report.txt
*/
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const storyPath = path.resolve(projectRoot, 'data', 'question_story.json');
const reportPath = path.resolve(__dirname, 'story_structure_report.txt');
const targetLangs = ['ko', 'es'];

function main() {
  const raw = fs.readFileSync(storyPath, 'utf8');
  const json = JSON.parse(raw);
  const chapters = Array.isArray(json.civicsStory) ? json.civicsStory : [];
  const lines = [];
  chapters.forEach((ch, ci) => {
    const chId = ch.chapterId || ci;
    if (!Array.isArray(ch.sections)) return;
    ch.sections.forEach((sec, si) => {
      const template = sec.content_en;
      if (!Array.isArray(template)) return;
      targetLangs.forEach((lang) => {
        const key = `content_${lang}`;
        const arr = sec[key];
        if (!Array.isArray(arr)) {
          lines.push(`chapter ${chId} section ${si}: ${key} missing`);
          return;
        }
        if (arr.length !== template.length) {
          lines.push(`chapter ${chId} section ${si}: ${key} length ${arr.length} != content_en length ${template.length}`);
        }
        const len = Math.min(arr.length, template.length);
        for (let i = 0; i < len; i++) {
          const t = template[i];
          const s = arr[i];
          if (!t || !s || t.type !== s.type) {
            lines.push(`chapter ${chId} section ${si} index ${i}: type mismatch for ${key} ('${s && s.type}' vs '${t && t.type}')`);
          }
          if (s && typeof s.text !== 'string') {
            lines.push(`chapter ${chId} section ${si} index ${i}: text not string for ${key}`);
          }
        }
      });
    });
  });
  fs.writeFileSync(reportPath, lines.join('\n') + (lines.length ? '\n' : ''), 'utf8');
  console.log(`[scan_story_mismatches] Wrote ${lines.length} lines to ${reportPath}`);
}

if (require.main === module) main();

#!/usr/bin/env node
/*
  Check structural isomorphism of story content across languages.
  - Validates that translations.<lang> exist for target languages
  - For each section, ensures content_<lang> exists and matches length and type sequence with content_en
  - If sectionTitle_en exists, requires sectionTitle_<lang> to exist too
  - Validates linkedQuestions is an array of numbers
*/

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const storyPath = path.resolve(projectRoot, 'data', 'question_story.json');

const targetLangs = ['en', 'ko', 'es', 'fr', 'ar', 'zh']; // Extend later: tl, vi

function fail(msg) {
  return { ok: false, msg };
}

function ok() { return { ok: true }; }

function validate() {
  let raw;
  try {
    raw = fs.readFileSync(storyPath, 'utf8');
  } catch (e) {
    return fail(`Read error: ${e.message}`);
  }
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    return fail(`JSON parse error: ${e.message}`);
  }

  const errors = [];

  const chapters = json && Array.isArray(json.civicsStory)
    ? json.civicsStory
    : null;

  if (!chapters) {
    errors.push('Root must contain civicsStory array');
  } else {
    chapters.forEach((ch, ci) => {
      // translations presence
      if (!ch.translations || typeof ch.translations !== 'object') {
        errors.push(`chapter ${ch.chapterId || ci}: missing translations object`);
      } else {
        targetLangs.forEach((lang) => {
          if (!ch.translations[lang]) {
            errors.push(`chapter ${ch.chapterId || ci}: missing translations.${lang}`);
          } else {
            const t = ch.translations[lang];
            if (typeof t.title !== 'string' || !t.title.trim()) {
              errors.push(`chapter ${ch.chapterId || ci}: translations.${lang}.title missing/empty`);
            }
            if (typeof t.introduction !== 'string' || !t.introduction.trim()) {
              errors.push(`chapter ${ch.chapterId || ci}: translations.${lang}.introduction missing/empty`);
            }
          }
        });
      }

      // sections
      if (!Array.isArray(ch.sections)) {
        errors.push(`chapter ${ch.chapterId || ci}: sections must be array`);
        return;
      }
      ch.sections.forEach((sec, si) => {
        // content_en is the template
        const template = sec[`content_en`];
        if (!Array.isArray(template) || template.length === 0) {
          errors.push(`chapter ${ch.chapterId || ci} section ${si}: content_en missing or empty`);
          return;
        }
        // Optional sectionTitle check: if sectionTitle_en exists, require others
        if (Object.prototype.hasOwnProperty.call(sec, 'sectionTitle_en')) {
          targetLangs.forEach((lang) => {
            const key = `sectionTitle_${lang}`;
            if (!sec[key] || typeof sec[key] !== 'string' || !sec[key].trim()) {
              errors.push(`chapter ${ch.chapterId || ci} section ${si}: ${key} missing/empty`);
            }
          });
        }

        // For each target language, ensure content_<lang> matches length and types
        targetLangs.forEach((lang) => {
          const key = `content_${lang}`;
          if (!Array.isArray(sec[key])) {
            errors.push(`chapter ${ch.chapterId || ci} section ${si}: ${key} missing`);
            return;
          }
          if (sec[key].length !== template.length) {
            errors.push(`chapter ${ch.chapterId || ci} section ${si}: ${key} length ${sec[key].length} != content_en length ${template.length}`);
          }
          const len = Math.min(template.length, sec[key].length);
          for (let i = 0; i < len; i++) {
            const tItem = template[i];
            const lItem = sec[key][i];
            if (!tItem || !lItem || tItem.type !== lItem.type) {
              errors.push(`chapter ${ch.chapterId || ci} section ${si} index ${i}: type mismatch for ${key} ('${lItem && lItem.type}' vs '${tItem && tItem.type}')`);
            }
            if (typeof lItem.text !== 'string') {
              errors.push(`chapter ${ch.chapterId || ci} section ${si} index ${i}: text not string for ${key}`);
            }
          }
        });

        // linkedQuestions validation
        if (!Array.isArray(sec.linkedQuestions) || !sec.linkedQuestions.every((n) => Number.isInteger(n))) {
          errors.push(`chapter ${ch.chapterId || ci} section ${si}: linkedQuestions must be array of integers`);
        }
      });
    });
  }

  if (errors.length) {
    return fail(errors.join('\n'));
  }
  return ok();
}

function main() {
  const res = validate();
  if (!res.ok) {
    console.log('\n[Story Structure Check] FAIL');
    console.log(res.msg);
    try {
      const reportPath = path.resolve(__dirname, 'story_structure_report.txt');
      fs.writeFileSync(reportPath, res.msg + '\n', 'utf8');
      console.log(`[Story Structure Check] Wrote report to ${reportPath}`);
    } catch (e) {
      console.log('[Story Structure Check] Failed to write report file:', String(e && e.stack || e));
    }
    process.exitCode = 1;
    return;
  }
  console.log(`[Story Structure Check] PASS: ${targetLangs.join('/')} structure is consistent`);
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.log('[Story Structure Check] ERROR');
    console.log(String(e && e.stack || e));
    process.exitCode = 1;
    return;
  }
}

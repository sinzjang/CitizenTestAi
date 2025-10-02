#!/usr/bin/env node
/*
  Fix civics story content arrays where a single answer token contains multiple comma-separated items.
  Expands such tokens into multiple answer tokens with normal ", " separators, for selected languages.
*/
const fs = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, '..', 'data', 'question_story.json');
const TARGET_LANGS = ['ko', 'es'];

function splitAnswerText(text) {
  // Split on comma + space. Keep parentheses content intact.
  // Also handle Spanish ", y " and Korean " 그리고 " which often appear before last item
  // We standardize splitting on ', ' only, then trim.
  const parts = text.split(',').map((p) => p.trim()).filter(Boolean);
  return parts;
}

function expandMultiAnswerTokens(content) {
  const out = [];
  for (let i = 0; i < content.length; i++) {
    const item = content[i];
    if (item && item.type === 'answer' && typeof item.text === 'string') {
      // Heuristic: multi items if there are at least 2 commas
      const commaCount = (item.text.match(/,/g) || []).length;
      if (commaCount >= 1) {
        const parts = splitAnswerText(item.text);
        if (parts.length > 1) {
          parts.forEach((p, idx) => {
            out.push({ type: 'answer', text: p });
            if (idx < parts.length - 1) {
              out.push({ type: 'normal', text: ', ' });
            }
          });
          continue; // skip default push
        }
      }
    }
    out.push(item);
  }
  return out;
}

function main() {
  const raw = fs.readFileSync(FILE, 'utf8');
  const json = JSON.parse(raw);
  const chapters = Array.isArray(json.civicsStory) ? json.civicsStory : [];

  let changed = 0;

  chapters.forEach((ch) => {
    if (!Array.isArray(ch.sections)) return;
    ch.sections.forEach((sec) => {
      TARGET_LANGS.forEach((lang) => {
        const key = `content_${lang}`;
        if (!Array.isArray(sec[key])) return;
        const beforeLen = sec[key].length;
        const expanded = expandMultiAnswerTokens(sec[key]);
        if (expanded.length !== beforeLen) {
          sec[key] = expanded;
          changed++;
        }
      });
    });
  });

  if (changed > 0) {
    fs.writeFileSync(FILE, JSON.stringify(json, null, 2) + '\n');
    console.log(`[fix] Applied expansions: ${changed} sections updated. Written to question_story.json`);
  } else {
    console.log('[fix] No changes needed.');
  }
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('Fix script error:', e);
    process.exit(1);
  }
}

#!/usr/bin/env node
/*
  Collapse translation patterns [answer][normal:", "][answer] into a single [answer]
  when the English template at that position expects a single 'answer' token.
  Applies to content_es and content_ko.
*/

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const storyPath = path.resolve(projectRoot, 'data', 'question_story.json');
const targetLangs = ['es', 'ko'];

function collapseCommaAnswerGroups(arr, template) {
  if (!Array.isArray(arr)) return arr;
  const out = [];
  let i = 0;

  while (i < arr.length) {
    const cur = arr[i];
    const nxt = arr[i + 1];
    const nxt2 = arr[i + 2];

    // Pattern: answer, normal(", "), answer  -> collapse into single answer
    const isAnswerCommaAnswer = cur && cur.type === 'answer'
      && nxt && nxt.type === 'normal' && /^,\s*$/.test(nxt.text || '')
      && nxt2 && nxt2.type === 'answer';

    if (isAnswerCommaAnswer) {
      out.push({ type: 'answer', text: String(cur.text || '') + ', ' + String(nxt2.text || '') });
      i += 3;
      continue;
    }

    // Default: push current and advance alignment if matches expected type
    out.push(cur);
    i += 1;
  }
  return out;
}

function processFile() {
  const raw = fs.readFileSync(storyPath, 'utf8');
  const json = JSON.parse(raw);
  const chapters = Array.isArray(json.civicsStory) ? json.civicsStory : [];

  let changes = 0;

  chapters.forEach((ch) => {
    if (!Array.isArray(ch.sections)) return;
    ch.sections.forEach((sec) => {
      const template = Array.isArray(sec.content_en) ? sec.content_en : [];
      targetLangs.forEach((lang) => {
        const key = `content_${lang}`;
        if (!Array.isArray(sec[key])) return;
        const before = sec[key].length;
        sec[key] = collapseCommaAnswerGroups(sec[key], template);
        const after = sec[key].length;
        if (after !== before) changes++;
      });
    });
  });

  if (changes > 0) {
    fs.writeFileSync(storyPath, JSON.stringify(json, null, 2), 'utf8');
    console.log(`[adjust_story_answer_comma_groups] Collapsed groups in ${changes} sections.`);
  } else {
    console.log('[adjust_story_answer_comma_groups] No changes made.');
  }
}

if (require.main === module) {
  processFile();
}

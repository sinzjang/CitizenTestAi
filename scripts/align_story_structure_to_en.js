#!/usr/bin/env node
/*
  Align story content arrays (content_ko, content_es) to match content_en length and type sequence.
  - If translation array is longer than English: greedily merge adjacent items until lengths match.
  - If translation array is shorter than English: attempt to expand answer tokens by splitting on commas (fallback heuristic).
  - Preserve semantics by concatenating text fields; set resulting item.type to template type.
*/

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const storyPath = path.resolve(projectRoot, 'data', 'question_story.json');
const targetLangs = ['ko', 'es'];
const logPath = path.resolve(__dirname, 'align_story_structure_to_en.log');

function splitAnswerOnCommas(item) {
  // Split only if type is 'answer' and contains a comma that likely denotes multiple parts
  if (!item || item.type !== 'answer') return [item];
  const parts = item.text.split(/,(?![^()]*\))/g).map(s => s.trim()).filter(Boolean);
  if (parts.length <= 1) return [item];
  return parts.map(p => ({ type: 'answer', text: p }));
}

function tryExpandToLength(src, templateLen) {
  // Expand by splitting answers on commas until reaching or passing template length
  let out = [];
  for (const it of src) {
    const pieces = splitAnswerOnCommas(it);
    out.push(...pieces);
  }
  return out;
}

function alignToTemplate(src, template) {
  let arr = src.slice();
  const tlen = template.length;

  // If shorter, try expanding once
  if (arr.length < tlen) {
    arr = tryExpandToLength(arr, tlen);
  }

  // If still shorter, just pad by duplicating last item (rare fallback)
  while (arr.length < tlen && arr.length > 0) {
    arr.push({ ...arr[arr.length - 1] });
  }

  // If longer, greedily merge adjacent items until lengths match
  if (arr.length > tlen) {
    // Merge strategy: always merge current index with the next, concatenating text
    let i = 0;
    while (arr.length > tlen && i < arr.length - 1) {
      const merged = {
        type: arr[i].type, // temporary; will be overridden by template type later
        text: String(arr[i].text || '') + String(arr[i + 1].text || ''),
      };
      arr.splice(i, 2, merged);
      // Only advance index when no longer need to merge at this position
      if (arr.length > tlen) {
        // keep i the same to allow further merges
      } else {
        i++;
      }
    }
  }

  // Now enforce template type and length
  const len = Math.min(arr.length, tlen);
  const result = [];
  for (let i = 0; i < len; i++) {
    const t = template[i];
    const s = arr[i] || { type: t.type, text: '' };
    result.push({ type: t.type, text: String(s.text ?? '') });
  }
  return result;
}

function processFile() {
  const raw = fs.readFileSync(storyPath, 'utf8');
  const json = JSON.parse(raw);

  const chapters = Array.isArray(json.civicsStory) ? json.civicsStory : [];
  let changed = 0;

  const logs = [];
  chapters.forEach((ch, ci) => {
    if (!Array.isArray(ch.sections)) return;
    ch.sections.forEach((sec, si) => {
      const template = sec.content_en;
      if (!Array.isArray(template) || template.length === 0) return;

      targetLangs.forEach((lang) => {
        const key = `content_${lang}`;
        if (!Array.isArray(sec[key])) return;
        const beforeLen = sec[key].length;
        if (beforeLen === template.length) return;
        const beforeTypeSeq = sec[key].map(x => x.type).join(',');
        const aligned = alignToTemplate(sec[key], template);
        if (aligned.length !== template.length) {
          // As a last resort, trim or pad to match
          if (aligned.length > template.length) {
            aligned.length = template.length;
          } else {
            while (aligned.length < template.length) {
              aligned.push({ type: template[aligned.length].type, text: '' });
            }
          }
        }
        sec[key] = aligned;
        const afterLen = sec[key].length;
        const afterTypeSeq = sec[key].map(x => x.type).join(',');
        logs.push(`chapter ${ch.chapterId || ci} section ${si} ${key}: ${beforeLen} -> ${afterLen} | types ${beforeTypeSeq} -> ${afterTypeSeq}`);
        changed++;
      });
    });
  });

  if (changed > 0) {
    fs.writeFileSync(storyPath, JSON.stringify(json, null, 2), 'utf8');
    try { fs.writeFileSync(logPath, logs.join('\n') + '\n', 'utf8'); } catch {}
    console.log(`[align_story_structure_to_en] Updated sections: ${changed}`);
  } else {
    try { fs.writeFileSync(logPath, '[align_story_structure_to_en] No changes needed\n', 'utf8'); } catch {}
    console.log('[align_story_structure_to_en] No changes needed');
  }
}

if (require.main === module) {
  processFile();
}

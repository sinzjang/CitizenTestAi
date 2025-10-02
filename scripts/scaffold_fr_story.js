#!/usr/bin/env node
/*
  Scaffold French (fr) story content based on English template.
  - Ensure translations.fr exists per chapter (copy EN as placeholder to pass validation)
  - Ensure content_fr exists per section with same length and type sequence as content_en (text can be empty strings)
  - If sectionTitle_en exists, ensure sectionTitle_fr exists (copy EN)
*/
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const storyPath = path.resolve(projectRoot, 'data', 'question_story.json');

function scaffold() {
  const raw = fs.readFileSync(storyPath, 'utf8');
  const json = JSON.parse(raw);
  const chapters = Array.isArray(json.civicsStory) ? json.civicsStory : [];
  let changes = 0;

  chapters.forEach((ch) => {
    // translations.fr
    if (!ch.translations) ch.translations = {};
    if (!ch.translations.fr) {
      const en = ch.translations.en || { title: '', introduction: '' };
      ch.translations.fr = {
        title: en.title || 'Titre',
        introduction: en.introduction || 'Introduction',
      };
      changes++;
    } else {
      // make sure required fields exist
      if (typeof ch.translations.fr.title !== 'string') ch.translations.fr.title = String(ch.translations.en && ch.translations.en.title || 'Titre');
      if (typeof ch.translations.fr.introduction !== 'string') ch.translations.fr.introduction = String(ch.translations.en && ch.translations.en.introduction || 'Introduction');
    }

    // sections content_fr
    if (!Array.isArray(ch.sections)) return;
    ch.sections.forEach((sec) => {
      const tpl = Array.isArray(sec.content_en) ? sec.content_en : [];
      if (!Array.isArray(sec.content_fr) || sec.content_fr.length !== tpl.length) {
        sec.content_fr = tpl.map((t) => ({ type: t.type, text: '' }));
        changes++;
      } else {
        // coerce types to match template
        let coerced = false;
        for (let i = 0; i < tpl.length; i++) {
          if (sec.content_fr[i].type !== tpl[i].type) {
            sec.content_fr[i] = { type: tpl[i].type, text: String(sec.content_fr[i].text ?? '') };
            coerced = true;
          } else if (typeof sec.content_fr[i].text !== 'string') {
            sec.content_fr[i].text = String(sec.content_fr[i].text ?? '');
            coerced = true;
          }
        }
        if (coerced) changes++;
      }

      // sectionTitle_fr if sectionTitle_en exists
      if (Object.prototype.hasOwnProperty.call(sec, 'sectionTitle_en')) {
        if (!sec.sectionTitle_fr || typeof sec.sectionTitle_fr !== 'string' || !sec.sectionTitle_fr.trim()) {
          sec.sectionTitle_fr = String(sec.sectionTitle_en || '');
          changes++;
        }
      }
    });
  });

  if (changes > 0) {
    fs.writeFileSync(storyPath, JSON.stringify(json, null, 2), 'utf8');
  }
  console.log(`[scaffold_fr_story] Changes applied: ${changes}`);
}

if (require.main === module) scaffold();

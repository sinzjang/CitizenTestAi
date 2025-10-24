# 다국어 번역 가이드

## 📋 개요

`question_story.json`에 여러 언어를 추가하는 완벽한 가이드입니다.
현재 한글(ko)과 영어(en)가 완성되었으며, 같은 방식으로 다른 언어를 추가할 수 있습니다.

---

## 🌍 지원 가능한 언어

| 언어 코드 | 언어명 | ChatGPT 번역 품질 |
|-----------|--------|-------------------|
| `es` | Spanish (스페인어) | ⭐⭐⭐⭐⭐ |
| `fr` | French (프랑스어) | ⭐⭐⭐⭐⭐ |
| `zh` | Chinese (중국어) | ⭐⭐⭐⭐⭐ |
| `ar` | Arabic (아랍어) | ⭐⭐⭐⭐ |
| `vi` | Vietnamese (베트남어) | ⭐⭐⭐⭐ |
| `ja` | Japanese (일본어) | ⭐⭐⭐⭐⭐ |
| `pt` | Portuguese (포르투갈어) | ⭐⭐⭐⭐⭐ |
| `ru` | Russian (러시아어) | ⭐⭐⭐⭐ |
| `hi` | Hindi (힌디어) | ⭐⭐⭐⭐ |
| `tl` | Tagalog (타갈로그어) | ⭐⭐⭐⭐ |

---

## 🚀 빠른 시작 (3단계)

### Step 1: CSV 생성 (1분)

```bash
cd /Users/seshin/Desktop/Personal/Private_Projects/CitizenTestAi/CitizenTestAi
python3 data/generate_translation_csv.py --language es
```

결과: `story_translation_full_sentences_es.csv` 생성

### Step 2: ChatGPT 번역 (10-30분)

1. ChatGPT Plus 열기
2. 생성된 CSV 파일 업로드
3. 아래 프롬프트 사용 (언어 코드만 변경)
4. 번역된 CSV 다운로드

### Step 3: JSON에 적용 (1분)

```bash
python3 data/apply_translation.py --language es
```

결과: `question_story.json`에 스페인어 추가 완료!

---

## 📝 ChatGPT 프롬프트 템플릿

### 스페인어 (Spanish)

```
첨부된 CSV 파일의 Korean_Full 컬럼을 Spanish_Full 컬럼으로 번역해주세요.

이 파일은 미국 시민권 시험 학습용 스토리입니다. 총 8개 챕터, 43개 항목이 있습니다.

## 번역 규칙

1. **[ANSWER:xxx] 형태 처리**
   - 이것은 미국 시민권 시험의 정답입니다
   - 정확한 스페인어 정답으로 교체해주세요
   - 예시:
     * [ANSWER:공화국] → República
     * [ANSWER:헌법] → Constitución
     * [ANSWER:의회] → Congreso

2. **번역 스타일**
   - 스토리텔링 톤 유지
   - 자연스럽고 흐름있는 스페인어
   - 교육적이면서도 흥미로운 문체

3. **문맥 유지**
   - 질문 번호 (Q.1, Q.2 등)는 그대로 유지
   - 전체 문장의 문맥을 고려하여 번역

번역이 완료되면 CSV 파일을 다운로드할 수 있도록 제공해주세요.
```

### 프랑스어 (French)

```
첨부된 CSV 파일의 Korean_Full 컬럼을 French_Full 컬럼으로 번역해주세요.

이 파일은 미국 시민권 시험 학습용 스토리입니다. 총 8개 챕터, 43개 항목이 있습니다.

## 번역 규칙

1. **[ANSWER:xxx] 형태 처리**
   - 이것은 미국 시민권 시험의 정답입니다
   - 정확한 프랑스어 정답으로 교체해주세요
   - 예시:
     * [ANSWER:공화국] → République
     * [ANSWER:헌법] → Constitution
     * [ANSWER:의회] → Congrès

2. **번역 스타일**
   - 스토리텔링 톤 유지
   - 자연스럽고 흐름있는 프랑스어
   - 교육적이면서도 흥미로운 문체

3. **문맥 유지**
   - 질문 번호 (Q.1, Q.2 등)는 그대로 유지
   - 전체 문장의 문맥을 고려하여 번역

번역이 완료되면 CSV 파일을 다운로드할 수 있도록 제공해주세요.
```

### 중국어 (Chinese)

```
请将附件CSV文件中的Korean_Full列翻译成Chinese_Full列。

这是美国公民考试学习故事。共有8章，43个项目。

## 翻译规则

1. **[ANSWER:xxx] 格式处理**
   - 这是美国公民考试的正确答案
   - 请替换为准确的中文答案
   - 例如:
     * [ANSWER:공화국] → 共和国
     * [ANSWER:헌법] → 宪法
     * [ANSWER:의회] → 国会

2. **翻译风格**
   - 保持故事叙述语气
   - 自然流畅的中文
   - 既有教育性又有趣味性

3. **保持上下文**
   - 问题编号 (Q.1, Q.2 等) 保持不变
   - 考虑整个句子的上下文进行翻译

翻译完成后，请提供可下载的CSV文件。
```

### 아랍어 (Arabic)

```
يرجى ترجمة عمود Korean_Full في ملف CSV المرفق إلى عمود Arabic_Full.

هذا ملف قصص تعليمية لاختبار الجنسية الأمريكية. يحتوي على 8 فصول و43 عنصرًا.

## قواعد الترجمة

1. **معالجة صيغة [ANSWER:xxx]**
   - هذه هي الإجابات الصحيحة لاختبار الجنسية الأمريكية
   - يرجى استبدالها بالإجابات العربية الدقيقة
   - أمثلة:
     * [ANSWER:공화국] → جمهورية
     * [ANSWER:헌법] → الدستور
     * [ANSWER:의회] → الكونغرس

2. **أسلوب الترجمة**
   - الحفاظ على نبرة السرد القصصي
   - عربية طبيعية وسلسة
   - أسلوب تعليمي وممتع

3. **الحفاظ على السياق**
   - أرقام الأسئلة (Q.1, Q.2 إلخ) تبقى كما هي
   - ترجمة مع مراعاة سياق الجملة بأكملها

بعد اكتمال الترجمة، يرجى توفير ملف CSV قابل للتنزيل.
```

---

## 🛠️ 자동화 스크립트

### CSV 생성 스크립트

`data/generate_translation_csv.py`:

```python
#!/usr/bin/env python3
import json
import csv
import sys
import argparse

def generate_csv(language_code):
    # question_story.json 로드
    with open('data/question_story.json', 'r', encoding='utf-8') as f:
        story = json.load(f)
    
    csv_data = []
    row_id = 1
    
    for chapter in story['civicsStory']:
        chapter_id = chapter['chapterId']
        
        # 제목
        csv_data.append({
            'ID': row_id,
            'ChapterID': chapter_id,
            'SectionID': 0,
            'Type': 'title',
            'Korean_Full': chapter['translations']['ko']['title'],
            f'{language_code.upper()}_Full': '',
            'Notes': f'Chapter {chapter_id} Title'
        })
        row_id += 1
        
        # 소개
        csv_data.append({
            'ID': row_id,
            'ChapterID': chapter_id,
            'SectionID': 0,
            'Type': 'introduction',
            'Korean_Full': chapter['translations']['ko']['introduction'],
            f'{language_code.upper()}_Full': '',
            'Notes': f'Chapter {chapter_id} Introduction'
        })
        row_id += 1
        
        # 섹션
        for section_idx, section in enumerate(chapter['sections'], 1):
            korean_full = ""
            for item in section['content_ko']:
                if item['type'] == 'answer':
                    korean_full += f"[ANSWER:{item['text']}]"
                else:
                    korean_full += item['text']
            
            csv_data.append({
                'ID': row_id,
                'ChapterID': chapter_id,
                'SectionID': section_idx,
                'Type': 'section',
                'Korean_Full': korean_full,
                f'{language_code.upper()}_Full': '',
                'Notes': f"Ch{chapter_id} Sec{section_idx} | Questions: {section['linkedQuestions']}"
            })
            row_id += 1
    
    # CSV 저장
    filename = f'data/story_translation_full_sentences_{language_code}.csv'
    with open(filename, 'w', newline='', encoding='utf-8-sig') as f:
        fieldnames = ['ID', 'ChapterID', 'SectionID', 'Type', 'Korean_Full', f'{language_code.upper()}_Full', 'Notes']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(csv_data)
    
    print(f"✅ {filename} 생성 완료!")
    print(f"   총 {len(csv_data)}개 항목")
    return filename

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--language', '-l', required=True, help='Language code (e.g., es, fr, zh)')
    args = parser.parse_args()
    
    generate_csv(args.language)
```

### 번역 적용 스크립트

`data/apply_multilingual_translation.py`:

```python
#!/usr/bin/env python3
import json
import csv
import re
import argparse

def apply_translation(language_code):
    # CSV 로드
    csv_filename = f'data/story_translation_full_sentences_{language_code}.csv'
    with open(csv_filename, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        csv_data = list(reader)
    
    # question_story.json 로드
    with open('data/question_story.json', 'r', encoding='utf-8') as f:
        story = json.load(f)
    
    # CSV를 챕터/섹션별로 그룹화
    csv_by_chapter = {}
    for row in csv_data:
        chapter_id = int(row['ChapterID'])
        section_id = int(row['SectionID'])
        
        if chapter_id not in csv_by_chapter:
            csv_by_chapter[chapter_id] = {}
        
        csv_by_chapter[chapter_id][section_id] = row
    
    # 번역 적용
    lang_full_key = f'{language_code.upper()}_Full'
    
    for chapter in story['civicsStory']:
        chapter_id = chapter['chapterId']
        
        # 제목과 소개
        title_row = [r for r in csv_data if int(r['ChapterID']) == chapter_id and r['Type'] == 'title'][0]
        intro_row = [r for r in csv_data if int(r['ChapterID']) == chapter_id and r['Type'] == 'introduction'][0]
        
        if language_code not in chapter['translations']:
            chapter['translations'][language_code] = {}
        
        chapter['translations'][language_code]['title'] = title_row.get(lang_full_key, '')
        chapter['translations'][language_code]['introduction'] = intro_row.get(lang_full_key, '')
        
        # 섹션
        for section_idx, section in enumerate(chapter['sections'], 1):
            row = csv_by_chapter[chapter_id][section_idx]
            translated_full = row[lang_full_key]
            
            if not translated_full:
                continue
            
            # [ANSWER:xxx] 마커 제거
            answer_pattern = re.compile(r'\[ANSWER:([^\]]+)\]')
            
            content_lang = []
            last_pos = 0
            
            for match in answer_pattern.finditer(translated_full):
                if match.start() > last_pos:
                    normal_text = translated_full[last_pos:match.start()]
                    if normal_text:
                        content_lang.append({"type": "normal", "text": normal_text})
                
                answer_text = match.group(1)
                content_lang.append({"type": "answer", "text": answer_text})
                
                last_pos = match.end()
            
            if last_pos < len(translated_full):
                final_text = translated_full[last_pos:]
                if final_text:
                    content_lang.append({"type": "normal", "text": final_text})
            
            section[f'content_{language_code}'] = content_lang
    
    # 저장
    with open('data/question_story.json', 'w', encoding='utf-8') as f:
        json.dump(story, f, ensure_ascii=False, indent=2)
    
    print(f"✅ {language_code} 번역 적용 완료!")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--language', '-l', required=True, help='Language code (e.g., es, fr, zh)')
    args = parser.parse_args()
    
    apply_translation(args.language)
```

---

## 📊 예상 작업 시간

| 언어 | CSV 생성 | ChatGPT 번역 | 적용 | 총 시간 |
|------|----------|--------------|------|---------|
| 1개 언어 | 1분 | 10-30분 | 1분 | 12-32분 |
| 5개 언어 | 5분 | 50분-2.5시간 | 5분 | 1-3시간 |
| 10개 언어 | 10분 | 1.5-5시간 | 10분 | 2-6시간 |

---

## 💡 팁

1. **병렬 처리**: 여러 ChatGPT 세션에서 동시에 번역 가능
2. **우선순위**: 사용자가 많은 언어부터 (스페인어, 중국어 등)
3. **품질 검토**: 각 언어별로 원어민 검토 권장
4. **점진적 추가**: 한 번에 모든 언어를 추가하지 말고 필요한 언어부터

---

## 🎯 최종 구조

```json
{
  "civicsStory": [
    {
      "chapterId": 1,
      "translations": {
        "en": { "title": "...", "introduction": "..." },
        "ko": { "title": "...", "introduction": "..." },
        "es": { "title": "...", "introduction": "..." },
        "fr": { "title": "...", "introduction": "..." },
        "zh": { "title": "...", "introduction": "..." }
      },
      "sections": [
        {
          "content_en": [...],
          "content_ko": [...],
          "content_es": [...],
          "content_fr": [...],
          "content_zh": [...],
          "linkedQuestions": [...]
        }
      ]
    }
  ]
}
```

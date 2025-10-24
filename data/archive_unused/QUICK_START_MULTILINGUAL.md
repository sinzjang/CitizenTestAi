# 🌍 다국어 번역 빠른 시작 가이드

## 📋 3단계로 새 언어 추가하기

### Step 1: CSV 생성 (1분)

```bash
# 스페인어
python3 data/generate_translation_csv.py --language es

# 프랑스어
python3 data/generate_translation_csv.py --language fr

# 중국어
python3 data/generate_translation_csv.py --language zh

# 아랍어
python3 data/generate_translation_csv.py --language ar

# 베트남어
python3 data/generate_translation_csv.py --language vi
```

결과: `story_translation_full_sentences_[언어코드].csv` 생성

---

### Step 2: ChatGPT에서 번역 (10-30분)

#### 2-1. ChatGPT Plus 열기

#### 2-2. CSV 파일 업로드
- 생성된 CSV 파일을 첨부

#### 2-3. 프롬프트 사용

**스페인어 (Spanish):**
```
첨부된 CSV 파일의 Korean_Full 컬럼을 ES_Full 컬럼으로 스페인어로 번역해주세요.

이 파일은 미국 시민권 시험 학습용 스토리입니다. 총 8개 챕터, 43개 항목이 있습니다.

규칙:
1. [ANSWER:xxx] 형태는 정확한 스페인어 정답으로 교체
   예: [ANSWER:공화국] → República
2. 스토리텔링 톤 유지, 자연스러운 스페인어
3. 질문 번호 (Q.1, Q.2 등)는 그대로 유지

번역 완료 후 CSV 파일을 제공해주세요.
```

**프랑스어 (French):**
```
첨부된 CSV 파일의 Korean_Full 컬럼을 FR_Full 컬럼으로 프랑스어로 번역해주세요.

이 파일은 미국 시민권 시험 학습용 스토리입니다. 총 8개 챕터, 43개 항목이 있습니다.

규칙:
1. [ANSWER:xxx] 형태는 정확한 프랑스어 정답으로 교체
   예: [ANSWER:공화국] → République
2. 스토리텔링 톤 유지, 자연스러운 프랑스어
3. 질문 번호 (Q.1, Q.2 등)는 그대로 유지

번역 완료 후 CSV 파일을 제공해주세요.
```

**중국어 (Chinese):**
```
请将附件CSV文件中的Korean_Full列翻译成ZH_Full列（中文）。

这是美国公民考试学习故事。共有8章，43个项目。

规则:
1. [ANSWER:xxx] 格式替换为准确的中文答案
   例: [ANSWER:공화국] → 共和国
2. 保持故事叙述语气，自然流畅的中文
3. 问题编号 (Q.1, Q.2 等) 保持不变

翻译完成后请提供CSV文件。
```

**아랍어 (Arabic):**
```
يرجى ترجمة عمود Korean_Full في ملف CSV المرفق إلى عمود AR_Full (العربية).

هذا ملف قصص تعليمية لاختبار الجنسية الأمريكية. يحتوي على 8 فصول و43 عنصرًا.

القواعد:
1. استبدل صيغة [ANSWER:xxx] بالإجابات العربية الدقيقة
   مثال: [ANSWER:공화국] → جمهورية
2. الحفاظ على نبرة السرد القصصي، عربية طبيعية وسلسة
3. أرقام الأسئلة (Q.1, Q.2 إلخ) تبقى كما هي

يرجى توفير ملف CSV بعد اكتمال الترجمة.
```

**베트남어 (Vietnamese):**
```
Vui lòng dịch cột Korean_Full trong file CSV đính kèm sang cột VI_Full (Tiếng Việt).

Đây là file câu chuyện học tập cho kỳ thi nhập quốc tịch Mỹ. Có 8 chương, 43 mục.

Quy tắc:
1. Thay thế định dạng [ANSWER:xxx] bằng câu trả lời tiếng Việt chính xác
   Ví dụ: [ANSWER:공화국] → Cộng hòa
2. Giữ giọng kể chuyện, tiếng Việt tự nhiên và mạch lạc
3. Số câu hỏi (Q.1, Q.2, v.v.) giữ nguyên

Vui lòng cung cấp file CSV sau khi hoàn thành dịch.
```

#### 2-4. 번역된 CSV 다운로드
- 같은 파일명으로 저장 (덮어쓰기)

---

### Step 3: JSON에 적용 (1분)

```bash
# 스페인어
python3 data/apply_multilingual_translation.py --language es

# 프랑스어
python3 data/apply_multilingual_translation.py --language fr

# 중국어
python3 data/apply_multilingual_translation.py --language zh

# 아랍어
python3 data/apply_multilingual_translation.py --language ar

# 베트남어
python3 data/apply_multilingual_translation.py --language vi
```

---

## ✅ 완료!

`question_story.json` 파일에 새 언어가 추가되었습니다:

```json
{
  "civicsStory": [
    {
      "chapterId": 1,
      "translations": {
        "en": { "title": "...", "introduction": "..." },
        "ko": { "title": "...", "introduction": "..." },
        "es": { "title": "...", "introduction": "..." }
      },
      "sections": [
        {
          "content_en": [...],
          "content_ko": [...],
          "content_es": [...],
          "linkedQuestions": [...]
        }
      ]
    }
  ]
}
```

---

## 🎯 추천 언어 우선순위

미국 이민자 커뮤니티 크기 기준:

1. **Spanish (es)** - 가장 큰 커뮤니티
2. **Chinese (zh)** - 두 번째로 큰 커뮤니티
3. **Vietnamese (vi)** - 세 번째
4. **Tagalog (tl)** - 필리핀
5. **Arabic (ar)** - 중동
6. **French (fr)** - 아프리카/캐나다
7. **Korean (ko)** - ✅ 이미 완료
8. **English (en)** - ✅ 이미 완료

---

## 💡 팁

### 병렬 처리
여러 ChatGPT 세션을 동시에 열어서 여러 언어를 동시에 번역 가능

### 품질 확인
각 언어별로 원어민 검토 권장

### 점진적 추가
한 번에 모든 언어를 추가하지 말고 필요한 언어부터 추가

---

## 📊 예상 소요 시간

| 작업 | 시간 |
|------|------|
| 1개 언어 추가 | 12-32분 |
| 5개 언어 추가 | 1-3시간 |
| 10개 언어 추가 | 2-6시간 |

---

## 🆘 문제 해결

### CSV 파일이 없다고 나올 때
```bash
# Step 1을 먼저 실행
python3 data/generate_translation_csv.py --language [언어코드]
```

### 번역이 적용되지 않을 때
- CSV 파일명이 정확한지 확인
- CSV에 번역된 내용이 있는지 확인 (컬럼명: ES_Full, FR_Full 등)

### ChatGPT가 CSV를 제대로 처리하지 못할 때
- CSV를 Google Sheets에 업로드
- GOOGLETRANSLATE 함수 사용
- 다시 CSV로 다운로드

---

## 🎉 완료 후

앱에서 언어 선택 기능 구현:

```javascript
const language = userSelectedLanguage; // 'en', 'ko', 'es', 'fr', etc.

const title = chapter.translations[language].title;
const content = section[`content_${language}`];
```

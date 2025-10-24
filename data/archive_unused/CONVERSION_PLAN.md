# 128문제 CSV → JSON 변환 계획

## 📋 현재 상황 분석

### 기존 JSON 구조 (100문제)
```json
{
  "id": 1,
  "question": "What is the supreme law of the land?",
  "correctAnswers": [
    {
      "text": "the Constitution",
      "rationale": "The Constitution is the foundational, supreme law..."
    }
  ],
  "wrongAnswers": [
    {
      "text": "the Declaration of Independence"
    }
  ]
}
```

### CSV 구조 (128문제)
```csv
Index,Category,SubCategory,Questions,Answers,rationale,Wrong
1,American Government,Principles of American Government,What is the form of government...,"Republic, Constitution-based federal republic","Background: The United States...","Monarchy, Communist dictatorship
Direct democracy, Oligarchy
Parliamentary system, Socialism-based republic"
```

## 🔄 변환 매핑

### CSV → JSON 필드 매핑

| CSV 필드 | JSON 필드 | 설명 |
|---------|----------|------|
| `Index` | `id` | 문제 번호 (1-128) |
| `Category` | `category` | **새로 추가**: 대분류 (American Government, American History, Symbols and Holidays) |
| `SubCategory` | `subcategory` | **새로 추가**: 소분류 (Principles of American Government 등) |
| `Questions` | `question` | 질문 텍스트 |
| `Answers` | `correctAnswers[].text` | 쉼표로 구분된 정답들 → 배열로 변환 |
| `rationale` | `correctAnswers[].rationale` | 정답 설명 (모든 정답에 동일하게 적용) |
| `Wrong` | `wrongAnswers[].text` | 줄바꿈으로 구분된 오답들 → 배열로 변환 |

## 🎯 새로운 JSON 구조

```json
{
  "id": 1,
  "category": "American Government",
  "subcategory": "Principles of American Government",
  "question": "What is the form of government of the United States?",
  "correctAnswers": [
    {
      "text": "Republic",
      "rationale": "Background: The United States operates under a system designed to prevent any single entity from gaining too much power.\nExplanation: The US government is a republic..."
    },
    {
      "text": "Constitution-based federal republic",
      "rationale": "Background: The United States operates under a system designed to prevent any single entity from gaining too much power.\nExplanation: The US government is a republic..."
    },
    {
      "text": "Representative democracy",
      "rationale": "Background: The United States operates under a system designed to prevent any single entity from gaining too much power.\nExplanation: The US government is a republic..."
    }
  ],
  "wrongAnswers": [
    {
      "text": "Monarchy"
    },
    {
      "text": "Communist dictatorship"
    },
    {
      "text": "Absolute monarchy"
    }
  ]
}
```

## 🔧 변환 로직

### 1. CSV 파싱
- CSV 파일 읽기 (멀티라인 필드 처리 필요)
- 각 행을 파싱하여 딕셔너리로 변환

### 2. 정답 처리
```python
# "Republic, Constitution-based federal republic, Representative democracy"
answers = row['Answers'].split(', ')
correctAnswers = [
    {
        "text": answer.strip(),
        "rationale": row['rationale']  # 모든 정답에 동일한 rationale
    }
    for answer in answers
]
```

### 3. 오답 처리
```python
# "Monarchy, Communist dictatorship, Absolute monarchy\nDirect democracy, Oligarchy, Theocracy\n..."
# 줄바꿈으로 구분된 그룹을 먼저 분리하고, 각 그룹 내에서 쉼표로 분리
wrong_lines = row['Wrong'].strip().split('\n')
wrongAnswers = []
for line in wrong_lines:
    for answer in line.split(', '):
        if answer.strip():
            wrongAnswers.append({"text": answer.strip()})
```

### 4. 카테고리 추가
```python
question_obj = {
    "id": int(row['Index']),
    "category": row['Category'],
    "subcategory": row['SubCategory'],
    "question": row['Questions'],
    "correctAnswers": correctAnswers,
    "wrongAnswers": wrongAnswers
}
```

## ⚠️ 주의사항

### 1. CSV 멀티라인 처리
- CSV의 `rationale`과 `Wrong` 필드는 여러 줄에 걸쳐 있음
- Python의 `csv.reader`는 기본적으로 멀티라인 필드를 처리함

### 2. 특수 문자 처리
- 쉼표(,): 정답 구분자
- 줄바꿈(\n): 오답 그룹 구분자
- 따옴표("): CSV 필드 구분자

### 3. 데이터 정제
- 앞뒤 공백 제거 (`.strip()`)
- 빈 문자열 필터링
- 특수 기호(*) 유지 (예: "What is the supreme law of the land? *")

## 📝 실행 단계

1. **백업 생성**
   - 기존 `interview_questions_en.json` 백업
   - `archived_backups/` 폴더에 타임스탬프 포함

2. **CSV → JSON 변환**
   - CSV 파일 읽기 및 파싱
   - 각 행을 JSON 객체로 변환
   - 배열로 결합

3. **검증**
   - 문제 수: 128개 확인
   - 필수 필드 존재 확인
   - 카테고리별 문제 수 확인
     - American Government: 72개
     - American History: 46개
     - Symbols and Holidays: 10개

4. **저장**
   - 새로운 JSON 파일 생성
   - 포맷팅: indent=2, ensure_ascii=False

## 🎯 예상 결과

- **문제 수**: 100개 → 128개 (+28개)
- **새 필드**: `category`, `subcategory` 추가
- **파일 크기**: 약 150-200KB 예상
- **구조**: 기존 앱 코드와 호환 (하위 호환성 유지)

## ✅ 검증 체크리스트

- [ ] 총 128개 문제 확인
- [ ] 모든 문제에 `id`, `category`, `subcategory` 존재
- [ ] `correctAnswers` 배열에 최소 1개 이상의 답변
- [ ] 각 정답에 `text`와 `rationale` 존재
- [ ] `wrongAnswers` 배열에 최소 3개 이상의 오답
- [ ] 카테고리별 문제 수 확인
- [ ] JSON 문법 오류 없음
- [ ] 특수 문자 정상 처리

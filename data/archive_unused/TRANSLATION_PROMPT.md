# CSV 번역 프롬프트 (ChatGPT/Claude용)

## 사용 방법
1. `story_translation_full_sentences.csv` 파일을 ChatGPT/Claude에 업로드
2. 아래 프롬프트를 복사하여 붙여넣기
3. 번역된 CSV 다운로드

---

## 프롬프트

```
첨부된 CSV 파일(story_translation_full_sentences.csv)의 Korean_Full 컬럼을 English_Full 컬럼으로 번역해주세요.

이 파일은 미국 시민권 시험 학습용 스토리입니다. 총 8개 챕터, 43개 항목이 있습니다.

## 번역 규칙

1. **[ANSWER:xxx] 형태 처리**
   - 이것은 미국 시민권 시험의 정답입니다
   - 정확한 영어 정답으로 교체해주세요
   - 예시:
     * [ANSWER:공화국] → Republic
     * [ANSWER:헌법 기반 연방 공화국] → Constitution-based federal republic
     * [ANSWER:대의민주주의] → Representative democracy
     * [ANSWER:헌법] → Constitution

2. **번역 스타일**
   - 스토리텔링 톤 유지
   - 자연스럽고 흐름있는 영어
   - 교육적이면서도 흥미로운 문체
   - "Once upon a time" 같은 표현 활용

3. **문맥 유지**
   - 전체 문장의 흐름을 고려
   - 문법적으로 자연스럽게
   - 질문 번호 (Q.1, Q.2 등) 유지

## 예시

### 입력 (Korean_Full):
```
옛날 옛적에, 자유와 정의를 꿈꾸던 사람들이 있었습니다. 그들은 새로운 나라를 세우며 이렇게 선언했죠. "우리는 [ANSWER:공화국]으로서, [ANSWER:헌법 기반 연방 공화국]의 원칙 아래 살며, 국민이 대표를 통해 스스로 다스리는 [ANSWER:대의민주주의] 국가를 만들 것이다!" (Q.1). 이들의 약속을 지탱하는 최고의 법은 바로 [ANSWER:헌법]이었습니다 (Q.2).
```

### 출력 (English_Full):
```
Once upon a time, there were people who dreamed of freedom and justice. As they established a new nation, they declared: "We shall live as a Republic, under the principles of a Constitution-based federal republic, and create a nation of Representative democracy where people govern themselves through representatives!" (Q.1). The supreme law supporting their promise was the Constitution (Q.2).
```

## 주의사항

- Type이 'title'이나 'introduction'인 경우: 이미 번역되어 있으면 그대로 유지
- Type이 'section'인 경우: 전체 문장을 자연스럽게 번역
- [ANSWER:xxx] 마커는 반드시 정확한 영어 정답으로 교체
- 질문 번호 (Q.1, Q.2 등)는 그대로 유지

번역이 완료되면 CSV 파일을 다운로드할 수 있도록 제공해주세요.
```

## 참고: 주요 정답 번역

| 한글 | 영어 |
|------|------|
| 공화국 | Republic |
| 헌법 기반 연방 공화국 | Constitution-based federal republic |
| 대의민주주의 | Representative democracy |
| 헌법 | Constitution |
| 입법부 | Legislative branch |
| 행정부 | Executive branch |
| 사법부 | Judicial branch |
| 의회 | Congress |
| 상원 | Senate |
| 하원 | House of Representatives |
| 대통령 | President |
| 대법원 | Supreme Court |
| 권리 장전 | Bill of Rights |
| 독립 선언문 | Declaration of Independence |
| 자유 | Liberty / Freedom |
| 평등 | Equality |
| 법치주의 | Rule of law |

더 많은 정답은 `interview_questions_en.json` 파일을 참고하세요.

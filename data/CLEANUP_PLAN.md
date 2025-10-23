# Data 폴더 정리 계획

## 🗑️ 삭제 가능한 파일들

### 1. 백업 파일들 (*.bak, *_backup*.json)
- `interview_questions_ar.json.bak` (168KB)
- `interview_questions_en.json.bak` (125KB)
- `interview_questions_es.json.bak` (135KB)
- `interview_questions_es_backup_2025-08-11T15-59-09.json` (122KB)
- `interview_questions_es_backup_2025-08-11T21-25-49.json` (111KB)
- `interview_questions_es_backup_complete_1755009016028.json` (125KB)
- `interview_questions_es_backup_final_2025-08-11T21-27-14.json` (112KB)
- `interview_questions_es_old_mixed_backup.json` (112KB)
- `interview_questions_fr.backup.20250815-175648.json` (119KB)
- `interview_questions_fr.json.bak` (140KB)
- `interview_questions_hi.backup.20250815-175827.json` (139KB)
- `interview_questions_hi.json.bak` (247KB)
- `interview_questions_hi_backup.json` (151KB)
- `interview_questions_ko_backup.json` (133KB)
- `interview_questions_tl.backup.20250815-175906.json` (116KB)
- `interview_questions_tl.json.bak` (139KB)
- `interview_questions_tl_backup.json` (119KB)
- `interview_questions_vi.backup.20250815-175941.json` (118KB)
- `interview_questions_vi.json.bak` (149KB)
- `interview_questions_vi_backup.json` (125KB)
- `interview_questions_zh.backup.20250815-180019.json` (104KB)
- `interview_questions_zh.json.bak` (111KB)
- `interview_questions_zh_backup.json` (108KB)

**총 23개 백업 파일, 약 3.1MB**

### 2. CSV 파일들 (앱에서 사용 안함)
- `interview_questions_ar.csv` (149KB)
- `interview_questions_es.csv` (118KB)
- `interview_questions_fr.csv` (122KB)
- `interview_questions_hi.csv` (226KB)
- `interview_questions_tl.csv` (121KB)
- `interview_questions_vi.csv` (130KB)
- `interview_questions_zh.csv` (93KB)
- `interview_questions_missing.csv` (27KB)
- `interview_questions_missing_ar.csv` (4KB)
- `interview_questions_missing_en.csv` (3KB)
- `interview_questions_missing_es.csv` (3KB)
- `interview_questions_missing_fr.csv` (3KB)
- `interview_questions_missing_hi.csv` (6KB)
- `interview_questions_missing_ko.csv` (3KB)
- `interview_questions_missing_tl.csv` (3KB)
- `interview_questions_missing_vi.csv` (3KB)
- `interview_questions_missing_zh.csv` (3KB)
- `n400_explanations_en.csv` (16KB)
- `n400_explanations_en_long.csv` (21KB)
- `test_debug.csv` (19KB)

**총 20개 CSV 파일, 약 1.1MB**

### 3. 리포트/디버그 파일들
- `interview_questions_es_report.json` (178KB)
- `test_debug.csv` (19KB)

**총 2개 파일, 약 197KB**

### 4. 사용하지 않는 기타 파일
- `interview_questions.json` (173KB) - 언어별 파일 사용 중
- `interview_questions_base.json` (2KB) - 용도 불명
- `application_guide.json` (18 bytes) - 거의 비어있음

**총 3개 파일, 약 175KB**

## ✅ 유지해야 할 파일들

### 앱에서 실제 사용하는 JSON 파일들
- `interview_questions_en.json` (127KB) ✅
- `interview_questions_ko.json` (134KB) ✅
- `interview_questions_es.json` (137KB) ✅
- `interview_questions_zh.json` (113KB) ✅
- `interview_questions_tl.json` (141KB) ✅
- `interview_questions_vi.json` (151KB) ✅
- `interview_questions_hi.json` (251KB) ✅
- `interview_questions_fr.json` (142KB) ✅
- `interview_questions_ar.json` (171KB) ✅

### 기타 필요한 파일들
- `n400_explanations.json` (22KB) ✅
- `n400_questions.json` (10KB) ✅
- `question_story.json` (203KB) ✅
- `translation_glossary.json` (2KB) ✅
- `us_political_data.json` (11KB) ✅
- `us_representatives.json` (17KB) ✅

## 📊 정리 요약

- **삭제 가능**: 48개 파일, 약 4.6MB
- **유지**: 15개 파일, 약 1.4MB
- **절감 효과**: 약 76% 용량 감소

## 🚀 실행 명령어

```bash
# 백업 폴더 생성
mkdir -p data/archived_backups

# 백업 파일들 이동
mv data/*.bak data/archived_backups/
mv data/*backup*.json data/archived_backups/

# CSV 파일들 이동
mkdir -p data/archived_csv
mv data/*.csv data/archived_csv/

# 리포트 파일 이동
mv data/interview_questions_es_report.json data/archived_backups/

# 사용하지 않는 파일 삭제
rm data/interview_questions.json
rm data/interview_questions_base.json
rm data/application_guide.json
```

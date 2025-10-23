#!/usr/bin/env python3
"""
번역된 CSV를 question_story.json에 적용하는 스크립트

사용법:
1. story_translation_full_sentences.csv를 번역
2. 번역된 CSV를 같은 이름으로 저장
3. python3 data/apply_translation.py 실행
"""

import json
import csv
import re

print("=" * 70)
print("🔄 번역된 CSV를 question_story.json에 적용")
print("=" * 70)

# CSV 로드 (영문 번역 완료 버전)
csv_data = []
with open('data/story_translation_full_sentences_en.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    csv_data = list(reader)

print(f"\n✅ CSV 로드 완료: {len(csv_data)}개 항목")

# question_story.json 로드
with open('data/question_story.json', 'r', encoding='utf-8') as f:
    story = json.load(f)

print(f"✅ question_story.json 로드 완료: {len(story['civicsStory'])}개 챕터")

# CSV를 챕터/섹션별로 그룹화
csv_by_chapter = {}
for row in csv_data:
    chapter_id = int(row['ChapterID'])
    section_id = int(row['SectionID'])
    
    if chapter_id not in csv_by_chapter:
        csv_by_chapter[chapter_id] = {}
    
    csv_by_chapter[chapter_id][section_id] = row

print(f"\n📝 번역 적용 중...")

# 각 챕터에 영어 번역 적용
for chapter in story['civicsStory']:
    chapter_id = chapter['chapterId']
    
    if chapter_id not in csv_by_chapter:
        print(f"  ⚠️  챕터 {chapter_id}: CSV에 없음")
        continue
    
    # 제목과 소개 (section_id = 0)
    if 0 in csv_by_chapter[chapter_id]:
        title_row = [r for r in csv_data if int(r['ChapterID']) == chapter_id and r['Type'] == 'title'][0]
        intro_row = [r for r in csv_data if int(r['ChapterID']) == chapter_id and r['Type'] == 'introduction'][0]
        
        if 'en' not in chapter['translations']:
            chapter['translations']['en'] = {}
        
        # English_Full 컬럼 사용
        chapter['translations']['en']['title'] = title_row.get('English_Full', title_row.get('Korean_Full', ''))
        chapter['translations']['en']['introduction'] = intro_row.get('English_Full', intro_row.get('Korean_Full', ''))
    
    # 각 섹션
    for section_idx, section in enumerate(chapter['sections'], 1):
        if section_idx not in csv_by_chapter[chapter_id]:
            print(f"  ⚠️  챕터 {chapter_id} 섹션 {section_idx}: CSV에 없음")
            continue
        
        row = csv_by_chapter[chapter_id][section_idx]
        english_full = row['English_Full']
        
        if not english_full:
            print(f"  ⚠️  챕터 {chapter_id} 섹션 {section_idx}: 번역 없음")
            continue
        
        # [ANSWER:xxx] 패턴 찾기
        answer_pattern = re.compile(r'\[ANSWER:([^\]]+)\]')
        
        # content_en 생성
        content_en = []
        last_pos = 0
        
        for match in answer_pattern.finditer(english_full):
            # 정답 앞의 일반 텍스트
            if match.start() > last_pos:
                normal_text = english_full[last_pos:match.start()]
                if normal_text:
                    content_en.append({
                        "type": "normal",
                        "text": normal_text
                    })
            
            # 정답 텍스트 (마커 제거)
            answer_text = match.group(0)  # [ANSWER:xxx] 전체
            content_en.append({
                "type": "answer",
                "text": answer_text
            })
            
            last_pos = match.end()
        
        # 마지막 일반 텍스트
        if last_pos < len(english_full):
            final_text = english_full[last_pos:]
            if final_text:
                content_en.append({
                    "type": "normal",
                    "text": final_text
                })
        
        # content_en 적용
        section['content_en'] = content_en
    
    print(f"  ✅ 챕터 {chapter_id}: 영어 번역 적용 완료")

# 파일 저장
with open('data/question_story.json', 'w', encoding='utf-8') as f:
    json.dump(story, f, ensure_ascii=False, indent=2)

print(f"\n💾 question_story.json 저장 완료!")
print(f"\n📊 결과:")
print(f"  ✅ 모든 챕터에 영어 번역 적용")
print(f"  ✅ content_en 생성 완료")
print(f"  ✅ [ANSWER:xxx] 마커는 그대로 유지 (나중에 정답으로 교체)")

print(f"\n⚠️  다음 단계:")
print(f"  [ANSWER:xxx] 형태를 실제 영어 정답으로 교체 필요")
print(f"  예: [ANSWER:공화국] → Republic")

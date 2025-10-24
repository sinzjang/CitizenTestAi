#!/usr/bin/env python3
"""
번역된 CSV를 question_story.json에 적용하는 스크립트 (다국어 지원)

사용법:
python3 data/apply_multilingual_translation.py --language es
python3 data/apply_multilingual_translation.py --language fr
python3 data/apply_multilingual_translation.py --language zh
"""

import json
import csv
import re
import argparse

def apply_translation(language_code):
    print("=" * 70)
    print(f"🔄 {language_code.upper()} 번역을 question_story.json에 적용")
    print("=" * 70)
    
    # CSV 로드
    csv_filename = f'data/story_translation_full_sentences_{language_code}.csv'
    try:
        with open(csv_filename, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            csv_data = list(reader)
        print(f"\n✅ {csv_filename} 로드 완료: {len(csv_data)}개 항목")
    except FileNotFoundError:
        print(f"\n❌ 오류: {csv_filename} 파일을 찾을 수 없습니다.")
        print(f"   먼저 generate_translation_csv.py를 실행하여 CSV를 생성하세요.")
        return
    
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
    
    # 번역 적용
    lang_full_key = f'{language_code.upper()}_Full'
    replaced_count = 0
    
    for chapter in story['civicsStory']:
        chapter_id = chapter['chapterId']
        
        if chapter_id not in csv_by_chapter:
            print(f"  ⚠️  챕터 {chapter_id}: CSV에 없음")
            continue
        
        # 제목과 소개
        title_row = [r for r in csv_data if int(r['ChapterID']) == chapter_id and r['Type'] == 'title'][0]
        intro_row = [r for r in csv_data if int(r['ChapterID']) == chapter_id and r['Type'] == 'introduction'][0]
        
        if language_code not in chapter['translations']:
            chapter['translations'][language_code] = {}
        
        chapter['translations'][language_code]['title'] = title_row.get(lang_full_key, '')
        chapter['translations'][language_code]['introduction'] = intro_row.get(lang_full_key, '')
        
        # 섹션
        for section_idx, section in enumerate(chapter['sections'], 1):
            if section_idx not in csv_by_chapter[chapter_id]:
                print(f"  ⚠️  챕터 {chapter_id} 섹션 {section_idx}: CSV에 없음")
                continue
            
            row = csv_by_chapter[chapter_id][section_idx]
            translated_full = row.get(lang_full_key, '')
            
            if not translated_full:
                print(f"  ⚠️  챕터 {chapter_id} 섹션 {section_idx}: 번역 없음")
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
                replaced_count += 1
                
                last_pos = match.end()
            
            if last_pos < len(translated_full):
                final_text = translated_full[last_pos:]
                if final_text:
                    content_lang.append({"type": "normal", "text": final_text})
            
            section[f'content_{language_code}'] = content_lang
        
        print(f"  ✅ 챕터 {chapter_id}: {language_code.upper()} 번역 적용 완료")
    
    # 저장
    with open('data/question_story.json', 'w', encoding='utf-8') as f:
        json.dump(story, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 question_story.json 저장 완료!")
    print(f"\n📊 결과:")
    print(f"  ✅ 모든 챕터에 translations.{language_code} 추가")
    print(f"  ✅ 모든 섹션에 content_{language_code} 추가")
    print(f"  ✅ {replaced_count}개 정답 적용")
    
    print(f"\n🎉 {language_code.upper()} 번역 적용 완료!")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='번역된 CSV를 JSON에 적용')
    parser.add_argument('--language', '-l', required=True, 
                        help='언어 코드 (예: es, fr, zh, ar, vi, ja, pt, ru, hi, tl)')
    args = parser.parse_args()
    
    apply_translation(args.language)

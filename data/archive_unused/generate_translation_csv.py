#!/usr/bin/env python3
"""
다국어 번역용 CSV 생성 스크립트

사용법:
python3 data/generate_translation_csv.py --language es
python3 data/generate_translation_csv.py --language fr
python3 data/generate_translation_csv.py --language zh
"""

import json
import csv
import argparse

def generate_csv(language_code):
    print("=" * 70)
    print(f"🌍 {language_code.upper()} 번역용 CSV 생성")
    print("=" * 70)
    
    # question_story.json 로드
    with open('data/question_story.json', 'r', encoding='utf-8') as f:
        story = json.load(f)
    
    print(f"\n✅ question_story.json 로드 완료")
    
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
    
    print(f"\n✅ {filename} 생성 완료!")
    print(f"   총 {len(csv_data)}개 항목")
    
    print(f"\n📝 다음 단계:")
    print(f"   1. {filename} 파일을 ChatGPT에 업로드")
    print(f"   2. MULTILINGUAL_TRANSLATION_GUIDE.md의 {language_code.upper()} 프롬프트 사용")
    print(f"   3. 번역된 CSV 다운로드")
    print(f"   4. python3 data/apply_multilingual_translation.py --language {language_code}")
    
    return filename

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='다국어 번역용 CSV 생성')
    parser.add_argument('--language', '-l', required=True, 
                        help='언어 코드 (예: es, fr, zh, ar, vi, ja, pt, ru, hi, tl)')
    args = parser.parse_args()
    
    generate_csv(args.language)

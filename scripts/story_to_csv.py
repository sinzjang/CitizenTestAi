#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
question_story_en.json을 CSV 테이블로 변환
"""

import json
import csv
from pathlib import Path

def extract_content_text(content_list):
    """content 배열에서 텍스트만 추출"""
    if not content_list:
        return ""
    
    text_parts = []
    for item in content_list:
        if isinstance(item, dict) and 'text' in item:
            text_parts.append(item['text'])
    
    return ''.join(text_parts)

def extract_answers(content_list):
    """content 배열에서 answer 타입만 추출"""
    if not content_list:
        return []
    
    answers = []
    for item in content_list:
        if isinstance(item, dict) and item.get('type') == 'answer':
            answers.append(item.get('text', ''))
    
    return answers

def story_to_csv(input_file, output_file):
    """스토리 JSON을 CSV로 변환"""
    
    print(f"📖 파일 읽기: {input_file.name}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'civicsStory' not in data:
        print("⚠️  civicsStory 키를 찾을 수 없습니다.")
        return
    
    # CSV 데이터 준비
    rows = []
    
    for chapter in data['civicsStory']:
        chapter_id = chapter.get('chapterId')
        title = chapter.get('title', '')
        introduction = chapter.get('introduction', '')
        sections = chapter.get('sections', [])
        
        # 챕터 정보 행 추가
        rows.append({
            'ChapterID': chapter_id,
            'ChapterTitle': title,
            'ChapterIntroduction': introduction,
            'SectionNumber': '',
            'SectionContent': '',
            'Answers': '',
            'QuestionID': '',
            'QuestionNumber': ''
        })
        
        # 각 섹션 추가
        for idx, section in enumerate(sections, 1):
            content = section.get('content', [])
            content_text = extract_content_text(content)
            answers = extract_answers(content)
            answers_text = ', '.join(answers)
            
            question_id = section.get('questionId', '')
            question_number = section.get('questionNumber', '')
            
            rows.append({
                'ChapterID': chapter_id,
                'ChapterTitle': '',
                'ChapterIntroduction': '',
                'SectionNumber': idx,
                'SectionContent': content_text,
                'Answers': answers_text,
                'QuestionID': question_id,
                'QuestionNumber': question_number
            })
    
    # CSV 저장
    print(f"\n💾 CSV 저장: {output_file.name}")
    
    fieldnames = [
        'ChapterID',
        'ChapterTitle',
        'ChapterIntroduction',
        'SectionNumber',
        'SectionContent',
        'Answers',
        'QuestionID',
        'QuestionNumber'
    ]
    
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    # 통계
    print(f"\n📊 통계:")
    print(f"  • 총 행 수: {len(rows)}개")
    
    chapter_count = sum(1 for row in rows if row['ChapterTitle'])
    section_count = sum(1 for row in rows if row['SectionNumber'])
    
    print(f"  • 챕터 수: {chapter_count}개")
    print(f"  • 섹션 수: {section_count}개")
    
    # 샘플
    print(f"\n📝 샘플 (처음 5행):")
    for i, row in enumerate(rows[:5], 1):
        if row['ChapterTitle']:
            print(f"\n{i}. 챕터 {row['ChapterID']}: {row['ChapterTitle']}")
            print(f"   소개: {row['ChapterIntroduction'][:60]}...")
        else:
            print(f"\n{i}. 섹션 {row['SectionNumber']}")
            print(f"   내용: {row['SectionContent'][:60]}...")
            if row['Answers']:
                print(f"   답변: {row['Answers']}")
    
    return rows

def main():
    print("=" * 60)
    print("🎯 스토리 JSON → CSV 변환")
    print("=" * 60)
    print()
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    input_file = data_dir / 'question_story_en.json'
    output_file = data_dir / 'question_story_en.csv'
    
    # 변환
    rows = story_to_csv(input_file, output_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 변환 완료: {len(rows)}개 행")
    print(f"📁 저장 위치: {output_file}")
    print("\n🎉 CSV 변환 완료!")

if __name__ == "__main__":
    main()

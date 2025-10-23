#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
기존 한국어 스토리 본문을 유지하면서 128문제를 linkedQuestions로 연결
"""

import json
import re
from pathlib import Path

def extract_question_numbers(content_list):
    """content에서 Q.숫자 패턴을 찾아서 질문 번호 추출"""
    question_nums = []
    
    for item in content_list:
        if isinstance(item, dict) and 'text' in item:
            # Q.1, Q.2 형식 찾기
            matches = re.findall(r'Q\.\s*(\d+)', item['text'])
            question_nums.extend([int(m) for m in matches])
    
    return sorted(list(set(question_nums)))

def merge_story_with_questions(story_file, output_file):
    """스토리 본문을 유지하고 linkedQuestions 추가"""
    
    print(f"📖 스토리 파일 읽기: {story_file.name}")
    
    with open(story_file, 'r', encoding='utf-8') as f:
        story = json.load(f)
    
    # 새로운 구조 생성
    new_story = {
        "civicsStory": []
    }
    
    all_linked_questions = set()
    
    for chapter in story['civicsStory']:
        new_chapter = {
            "chapterId": chapter['chapterId'],
            "translations": {
                "ko": {
                    "title": chapter['title'],
                    "introduction": chapter['introduction']
                }
            },
            "sections": []
        }
        
        # 각 섹션 처리
        for section in chapter.get('sections', []):
            content_ko = section.get('content', [])
            
            # content에서 질문 번호 추출
            linked_questions = extract_question_numbers(content_ko)
            all_linked_questions.update(linked_questions)
            
            new_section = {
                "content_ko": content_ko
            }
            
            if linked_questions:
                new_section["linkedQuestions"] = linked_questions
            
            new_chapter['sections'].append(new_section)
        
        new_story['civicsStory'].append(new_chapter)
    
    # JSON 저장
    print(f"\n💾 저장: {output_file.name}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(new_story, f, ensure_ascii=False, indent=2)
    
    # 통계
    print(f"\n📊 통계:")
    print(f"  • 총 챕터 수: {len(new_story['civicsStory'])}개")
    
    total_sections = sum(len(ch['sections']) for ch in new_story['civicsStory'])
    print(f"  • 총 섹션 수: {total_sections}개")
    print(f"  • 연결된 질문 수: {len(all_linked_questions)}개")
    
    # 누락된 질문 확인
    all_128 = set(range(1, 129))
    missing = all_128 - all_linked_questions
    
    if missing:
        print(f"\n⚠️  스토리에 연결되지 않은 질문: {sorted(missing)}")
        print(f"   총 {len(missing)}개 질문이 누락됨")
    else:
        print(f"\n✅ 모든 128개 질문이 스토리에 연결되었습니다!")
    
    # 샘플
    print(f"\n📝 샘플 (첫 번째 챕터):")
    if new_story['civicsStory']:
        first_chapter = new_story['civicsStory'][0]
        print(f"  • 챕터 ID: {first_chapter['chapterId']}")
        print(f"  • 제목: {first_chapter['translations']['ko']['title']}")
        print(f"  • 섹션 수: {len(first_chapter['sections'])}개")
        
        if first_chapter['sections']:
            first_section = first_chapter['sections'][0]
            linked = first_section.get('linkedQuestions', [])
            print(f"  • 첫 섹션 연결 질문: {linked}")
    
    return new_story, missing

def main():
    print("=" * 60)
    print("🎯 스토리 본문 + linkedQuestions 병합")
    print("=" * 60)
    print()
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    story_file = data_dir / 'question_story_ko.json'
    output_file = data_dir / 'question_story.json'
    
    # 병합
    story, missing = merge_story_with_questions(story_file, output_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 병합 완료")
    print(f"📁 저장 위치: {output_file}")
    
    if missing:
        print(f"\n⚠️  {len(missing)}개 질문이 기존 스토리에 연결되지 않았습니다.")
        print(f"   이 질문들을 위한 새로운 섹션을 추가해야 합니다.")
    else:
        print(f"\n🎉 모든 질문이 스토리에 연결되었습니다!")

if __name__ == "__main__":
    main()

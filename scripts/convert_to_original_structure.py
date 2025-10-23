#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
새로운 스토리 구조를 기존 형식(translations, content_ko)으로 변환
"""

import json
from pathlib import Path

def convert_question_to_content(question_data):
    """질문 데이터를 content_ko 형식으로 변환"""
    content = []
    
    # 질문 텍스트 추가
    content.append({
        "type": "normal",
        "text": f"Q.{question_data['questionId']}: {question_data['question']} "
    })
    
    # 정답 추가
    if question_data.get('correctAnswers'):
        for i, answer in enumerate(question_data['correctAnswers']):
            if i > 0:
                content.append({
                    "type": "normal",
                    "text": ", "
                })
            
            # 정답 텍스트를 answer 타입으로
            answer_text = answer.get('text', '')
            # 쉼표로 구분된 여러 답변 처리
            answer_parts = [a.strip() for a in answer_text.split(',')]
            
            for j, part in enumerate(answer_parts):
                if j > 0:
                    content.append({
                        "type": "normal",
                        "text": ", "
                    })
                content.append({
                    "type": "answer",
                    "text": part
                })
    
    content.append({
        "type": "normal",
        "text": "."
    })
    
    return content

def convert_to_original_structure(input_file, output_file):
    """새 구조를 기존 구조로 변환"""
    
    print(f"📖 파일 읽기: {input_file.name}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    new_story = {
        "civicsStory": []
    }
    
    for chapter in data['civicsStory']:
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
        
        # 섹션 변환
        for section in chapter.get('sections', []):
            new_section = {
                "content_ko": convert_question_to_content(section),
                "questionId": section.get('questionId'),
                "questionNumber": section.get('questionNumber')
            }
            
            new_chapter['sections'].append(new_section)
        
        new_story['civicsStory'].append(new_chapter)
    
    # JSON 저장
    print(f"\n💾 변환된 파일 저장: {output_file.name}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(new_story, f, ensure_ascii=False, indent=2)
    
    # 통계
    print(f"\n📊 통계:")
    print(f"  • 총 챕터 수: {len(new_story['civicsStory'])}개")
    
    total_sections = sum(len(ch['sections']) for ch in new_story['civicsStory'])
    print(f"  • 총 섹션 수: {total_sections}개")
    
    # 샘플
    print(f"\n📝 샘플 (첫 번째 챕터):")
    if new_story['civicsStory']:
        first_chapter = new_story['civicsStory'][0]
        print(f"  • 챕터 ID: {first_chapter['chapterId']}")
        print(f"  • 제목 (ko): {first_chapter['translations']['ko']['title']}")
        print(f"  • 소개 (ko): {first_chapter['translations']['ko']['introduction'][:60]}...")
        print(f"  • 섹션 수: {len(first_chapter['sections'])}개")
        
        if first_chapter['sections']:
            first_section = first_chapter['sections'][0]
            print(f"  • 첫 섹션 questionId: {first_section.get('questionId')}")
            print(f"  • 첫 섹션 content_ko 항목 수: {len(first_section['content_ko'])}개")
    
    return new_story

def main():
    print("=" * 60)
    print("🎯 기존 구조로 변환 (translations + content_ko)")
    print("=" * 60)
    print()
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    input_file = data_dir / 'question_story_ko_new.json'
    output_file = data_dir / 'question_story.json'
    
    # 변환
    story = convert_to_original_structure(input_file, output_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 변환 완료")
    print(f"📁 저장 위치: {output_file}")
    print("\n🎉 기존 구조 형식으로 변환 완료!")
    print("\n📝 구조:")
    print("  • translations.ko.title")
    print("  • translations.ko.introduction")
    print("  • sections[].content_ko[]")
    print("  • sections[].questionId")
    print("  • sections[].questionNumber")

if __name__ == "__main__":
    main()

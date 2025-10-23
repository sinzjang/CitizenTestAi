#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
question_story.json에서 영문 버전만 추출
"""

import json
from pathlib import Path

def extract_english_content(content_list):
    """content_en 또는 content_ko 등에서 텍스트만 추출"""
    if not content_list:
        return ""
    
    text_parts = []
    for item in content_list:
        if isinstance(item, dict) and 'text' in item:
            text_parts.append(item['text'])
    
    return ' '.join(text_parts)

def extract_english_story(input_file, output_file):
    """영문 스토리만 추출하여 새 JSON 생성"""
    
    print(f"📖 파일 읽기: {input_file.name}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    english_story = {
        "civicsStory": []
    }
    
    if 'civicsStory' not in data:
        print("⚠️  civicsStory 키를 찾을 수 없습니다.")
        return
    
    for chapter in data['civicsStory']:
        chapter_id = chapter.get('chapterId')
        translations = chapter.get('translations', {})
        sections = chapter.get('sections', [])
        
        # 영문 번역 추출
        en_translation = translations.get('en', {})
        
        # 영문 섹션 추출
        en_sections = []
        for section in sections:
            en_section = {}
            
            # content_en 추출
            if 'content_en' in section:
                en_section['content'] = section['content_en']
            
            # content_ko가 있고 content_en이 없는 경우 (혹시 몰라서)
            elif 'content_ko' in section:
                # 영문이 없으면 건너뛰기
                continue
            
            # 질문 관련 정보
            if 'questionId' in section:
                en_section['questionId'] = section['questionId']
            if 'questionNumber' in section:
                en_section['questionNumber'] = section['questionNumber']
            
            if en_section:
                en_sections.append(en_section)
        
        # 영문 챕터 생성
        en_chapter = {
            "chapterId": chapter_id,
            "title": en_translation.get('title', ''),
            "introduction": en_translation.get('introduction', ''),
            "sections": en_sections
        }
        
        english_story['civicsStory'].append(en_chapter)
    
    # JSON 저장
    print(f"\n💾 영문 스토리 저장: {output_file.name}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(english_story, f, ensure_ascii=False, indent=2)
    
    # 통계
    print(f"\n📊 통계:")
    print(f"  • 총 챕터 수: {len(english_story['civicsStory'])}개")
    
    total_sections = sum(len(ch['sections']) for ch in english_story['civicsStory'])
    print(f"  • 총 섹션 수: {total_sections}개")
    
    # 샘플
    print(f"\n📝 샘플 (첫 번째 챕터):")
    if english_story['civicsStory']:
        first_chapter = english_story['civicsStory'][0]
        print(f"  • 챕터 ID: {first_chapter['chapterId']}")
        print(f"  • 제목: {first_chapter['title']}")
        print(f"  • 소개: {first_chapter['introduction'][:100]}...")
        print(f"  • 섹션 수: {len(first_chapter['sections'])}개")
        
        if first_chapter['sections']:
            first_section = first_chapter['sections'][0]
            content_text = extract_english_content(first_section.get('content', []))
            print(f"  • 첫 섹션 내용: {content_text[:100]}...")
    
    return english_story

def main():
    print("=" * 60)
    print("🎯 영문 스토리 추출")
    print("=" * 60)
    print()
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    input_file = data_dir / 'question_story.json'
    output_file = data_dir / 'question_story_en.json'
    
    # 추출
    story = extract_english_story(input_file, output_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 추출 완료")
    print(f"📁 저장 위치: {output_file}")
    print("\n🎉 영문 스토리 추출 완료!")

if __name__ == "__main__":
    main()

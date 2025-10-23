#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
기존 스토리 본문만 유지하고 질문 형태 섹션은 제거
"""

import json
import re
from pathlib import Path

def is_question_only_section(content_ko):
    """섹션이 "Q.숫자: 질문? 답변." 형태만 있는지 확인"""
    if not content_ko or len(content_ko) < 2:
        return False
    
    # 첫 번째 항목이 "Q.숫자:"로 시작하는지 확인
    first_text = content_ko[0].get('text', '')
    if re.match(r'^Q\.\d+:', first_text):
        # 전체 텍스트 길이가 짧으면 질문만 있는 섹션
        total_text = ''.join([item.get('text', '') for item in content_ko])
        # 스토리 본문은 보통 길이가 길고, 질문만 있는 섹션은 짧음
        if len(total_text) < 200:  # 200자 미만이면 질문만 있는 섹션으로 간주
            return True
    
    return False

def clean_story(input_file, output_file):
    """질문 형태 섹션을 제거하고 스토리 본문만 유지"""
    
    print(f"📖 파일 읽기: {input_file.name}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    cleaned_story = {
        "civicsStory": []
    }
    
    removed_sections = 0
    kept_sections = 0
    
    for chapter in data['civicsStory']:
        new_chapter = {
            "chapterId": chapter['chapterId'],
            "translations": chapter['translations'],
            "sections": []
        }
        
        for section in chapter.get('sections', []):
            content_ko = section.get('content_ko', [])
            
            # 질문만 있는 섹션인지 확인
            if is_question_only_section(content_ko):
                removed_sections += 1
                continue
            
            # 스토리 본문 섹션은 유지
            new_chapter['sections'].append(section)
            kept_sections += 1
        
        cleaned_story['civicsStory'].append(new_chapter)
    
    # JSON 저장
    print(f"\n💾 저장: {output_file.name}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(cleaned_story, f, ensure_ascii=False, indent=2)
    
    # 통계
    print(f"\n📊 정리 결과:")
    print(f"  • 유지된 섹션: {kept_sections}개 (스토리 본문)")
    print(f"  • 제거된 섹션: {removed_sections}개 (질문 형태)")
    
    # 연결된 질문 확인
    all_linked = set()
    for chapter in cleaned_story['civicsStory']:
        for section in chapter['sections']:
            all_linked.update(section.get('linkedQuestions', []))
    
    print(f"\n  • 스토리에 연결된 질문: {len(all_linked)}개")
    
    missing = set(range(1, 129)) - all_linked
    if missing:
        print(f"  • 스토리에 없는 질문: {len(missing)}개")
        print(f"    {sorted(missing)[:20]}{'...' if len(missing) > 20 else ''}")
    
    return cleaned_story

def main():
    print("=" * 60)
    print("🎯 스토리 정리: 본문만 유지")
    print("=" * 60)
    print()
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    input_file = data_dir / 'question_story.json'
    output_file = data_dir / 'question_story_cleaned.json'
    
    # 정리
    story = clean_story(input_file, output_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 정리 완료")
    print(f"📁 저장 위치: {output_file}")
    print("\n📝 질문 형태 섹션이 제거되고 스토리 본문만 남았습니다.")
    print("   나머지 질문들은 별도로 처리하거나 새로운 스토리를 작성해야 합니다.")

if __name__ == "__main__":
    main()

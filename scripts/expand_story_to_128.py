#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
기존 스토리를 확장하여 128문제 모두 포함
"""

import json
import re
from pathlib import Path

def extract_question_numbers(content_list):
    """content에서 Q.숫자 패턴을 찾아서 질문 번호 추출"""
    question_nums = []
    
    for item in content_list:
        if isinstance(item, dict) and 'text' in item:
            matches = re.findall(r'Q\.\s*(\d+)', item['text'])
            question_nums.extend([int(m) for m in matches])
    
    return sorted(list(set(question_nums)))

def create_section_from_question(question_data):
    """질문 데이터로부터 섹션 생성"""
    content_ko = []
    
    # 질문 추가
    content_ko.append({
        "type": "normal",
        "text": f"Q.{question_data['id']}: {question_data['question']} "
    })
    
    # 정답 추가
    if question_data.get('correctAnswers'):
        for i, answer in enumerate(question_data['correctAnswers']):
            answer_text = answer.get('text', '')
            # 쉼표로 구분된 답변들
            answer_parts = [a.strip() for a in answer_text.split(',')]
            
            for j, part in enumerate(answer_parts):
                if i > 0 or j > 0:
                    content_ko.append({
                        "type": "normal",
                        "text": ", "
                    })
                content_ko.append({
                    "type": "answer",
                    "text": part
                })
    
    content_ko.append({
        "type": "normal",
        "text": "."
    })
    
    return {
        "content_ko": content_ko,
        "linkedQuestions": [question_data['id']]
    }

def expand_story(story_file, questions_file, output_file):
    """스토리를 확장하여 모든 질문 포함"""
    
    print(f"📖 스토리 파일 읽기: {story_file.name}")
    with open(story_file, 'r', encoding='utf-8') as f:
        story = json.load(f)
    
    print(f"📖 질문 파일 읽기: {questions_file.name}")
    with open(questions_file, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    # 질문을 ID로 인덱싱
    questions_by_id = {q['id']: q for q in questions}
    
    # 기존 스토리에서 연결된 질문 찾기
    covered_questions = set()
    
    for chapter in story['civicsStory']:
        for section in chapter.get('sections', []):
            content_ko = section.get('content', [])
            linked = extract_question_numbers(content_ko)
            covered_questions.update(linked)
    
    # 누락된 질문
    all_questions = set(range(1, 129))
    missing_questions = sorted(all_questions - covered_questions)
    
    print(f"\n📊 현재 상태:")
    print(f"  • 기존 스토리 커버: {len(covered_questions)}개 질문")
    print(f"  • 누락된 질문: {len(missing_questions)}개")
    
    # 새로운 구조 생성
    new_story = {
        "civicsStory": []
    }
    
    # 기존 챕터 복사 (translations 구조로)
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
        
        # 기존 섹션 복사
        for section in chapter.get('sections', []):
            content_ko = section.get('content', [])
            linked = extract_question_numbers(content_ko)
            
            new_section = {
                "content_ko": content_ko
            }
            
            if linked:
                new_section["linkedQuestions"] = linked
            
            new_chapter['sections'].append(new_section)
        
        new_story['civicsStory'].append(new_chapter)
    
    # 누락된 질문들을 카테고리별로 그룹화
    missing_by_category = {}
    for q_id in missing_questions:
        if q_id in questions_by_id:
            q = questions_by_id[q_id]
            cat = q.get('category', '기타')
            if cat not in missing_by_category:
                missing_by_category[cat] = []
            missing_by_category[cat].append(q)
    
    # 누락된 질문들을 기존 챕터에 추가하거나 새 챕터 생성
    print(f"\n📝 누락된 질문 추가:")
    
    for category, qs in missing_by_category.items():
        print(f"  • {category}: {len(qs)}개 질문")
        
        # 카테고리에 맞는 챕터 찾기 또는 새로 생성
        target_chapter = None
        
        # 기존 챕터에 추가 (간단하게 마지막 챕터에 추가)
        if new_story['civicsStory']:
            # 카테고리별로 적절한 챕터 찾기
            if "정부" in category:
                target_chapter = new_story['civicsStory'][0] if len(new_story['civicsStory']) > 0 else None
            elif "역사" in category:
                target_chapter = new_story['civicsStory'][3] if len(new_story['civicsStory']) > 3 else None
            elif "상징" in category or "휴일" in category:
                target_chapter = new_story['civicsStory'][4] if len(new_story['civicsStory']) > 4 else None
            else:
                target_chapter = new_story['civicsStory'][-1]
        
        if not target_chapter:
            # 새 챕터 생성
            new_chapter_id = len(new_story['civicsStory']) + 1
            target_chapter = {
                "chapterId": new_chapter_id,
                "translations": {
                    "ko": {
                        "title": f"{category} 추가 내용",
                        "introduction": f"{category}에 관한 추가 질문들입니다."
                    }
                },
                "sections": []
            }
            new_story['civicsStory'].append(target_chapter)
        
        # 질문들을 섹션으로 추가
        for q in qs:
            section = create_section_from_question(q)
            target_chapter['sections'].append(section)
    
    # JSON 저장
    print(f"\n💾 저장: {output_file.name}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(new_story, f, ensure_ascii=False, indent=2)
    
    # 최종 통계
    total_linked = set()
    for chapter in new_story['civicsStory']:
        for section in chapter['sections']:
            total_linked.update(section.get('linkedQuestions', []))
    
    print(f"\n📊 최종 통계:")
    print(f"  • 총 챕터 수: {len(new_story['civicsStory'])}개")
    
    total_sections = sum(len(ch['sections']) for ch in new_story['civicsStory'])
    print(f"  • 총 섹션 수: {total_sections}개")
    print(f"  • 연결된 질문 수: {len(total_linked)}개")
    
    still_missing = all_questions - total_linked
    if still_missing:
        print(f"\n⚠️  여전히 누락: {sorted(still_missing)}")
    else:
        print(f"\n✅ 모든 128개 질문이 포함되었습니다!")
    
    return new_story

def main():
    print("=" * 60)
    print("🎯 스토리 확장: 128문제 모두 포함")
    print("=" * 60)
    print()
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    story_file = data_dir / 'question_story_ko.json'
    questions_file = data_dir / 'interview_questions_ko.json'
    output_file = data_dir / 'question_story.json'
    
    # 확장
    story = expand_story(story_file, questions_file, output_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 확장 완료")
    print(f"📁 저장 위치: {output_file}")
    print("\n🎉 기존 스토리 본문 + 128문제 모두 포함!")

if __name__ == "__main__":
    main()

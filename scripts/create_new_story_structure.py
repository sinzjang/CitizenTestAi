#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
interview_questions_ko.json 128문제를 기반으로 새로운 스토리 구조 생성
"""

import json
from pathlib import Path

def create_story_structure():
    """새로운 스토리 구조 생성"""
    
    story = {
        "civicsStory": [
            {
                "chapterId": 1,
                "title": "자유를 위한 청사진: 헌법의 탄생",
                "introduction": "미국이라는 나라가 시작되기 전, 위대한 건국의 아버지들은 가장 중요한 '설계도'를 그렸습니다. 이 헌법이 없었다면 지금의 미국은 존재하지 않았을 것입니다.",
                "questionRange": "Q.1-15",
                "questionIds": list(range(1, 16)),
                "topics": [
                    "헌법의 역할과 중요성",
                    "권리장전과 수정헌법",
                    "독립선언서",
                    "미국 정부의 기본 원칙",
                    "경제 시스템과 종교의 자유"
                ]
            },
            {
                "chapterId": 2,
                "title": "삼권분립: 권력의 균형",
                "introduction": "권력이 한 곳에 집중되면 위험합니다. 건국의 아버지들은 이를 막기 위해 정부를 세 개의 부서로 나누고, 서로를 견제하고 균형을 맞추도록 설계했습니다.",
                "questionRange": "Q.16-35",
                "questionIds": list(range(16, 36)),
                "topics": [
                    "입법부: 의회의 구조와 역할",
                    "상원과 하원의 차이",
                    "행정부: 대통령의 권한",
                    "사법부: 법원의 역할",
                    "내각과 주요 직책"
                ]
            },
            {
                "chapterId": 3,
                "title": "연방과 주: 권력의 분배",
                "introduction": "미국은 연방정부와 주정부가 권력을 나누어 가집니다. 어떤 권한은 연방정부만 가지고, 어떤 권한은 주정부가 가지며, 일부는 함께 공유합니다.",
                "questionRange": "Q.36-47",
                "questionIds": list(range(36, 48)),
                "topics": [
                    "연방정부의 고유 권한",
                    "주정부의 권한",
                    "주지사와 주의회",
                    "정당 시스템",
                    "지역별 대표자 확인"
                ]
            },
            {
                "chapterId": 4,
                "title": "선거와 투표: 민주주의의 실천",
                "introduction": "민주주의는 국민이 직접 참여할 때 살아 숨쉽니다. 투표는 가장 중요한 시민의 권리이자 책임입니다.",
                "questionRange": "Q.48-62",
                "questionIds": list(range(48, 63)),
                "topics": [
                    "투표권의 역사와 확대",
                    "선거인단 제도",
                    "대통령 선거 과정",
                    "의회 선거",
                    "투표 참여 방법"
                ]
            },
            {
                "chapterId": 5,
                "title": "시민의 권리와 책임",
                "introduction": "미국 시민이 된다는 것은 특별한 권리를 누리는 동시에 중요한 책임을 지는 것을 의미합니다.",
                "questionRange": "Q.63-72",
                "questionIds": list(range(63, 73)),
                "topics": [
                    "시민만의 권리",
                    "모든 거주자의 권리",
                    "시민의 의무",
                    "충성 서약",
                    "민주주의 참여 방법"
                ]
            },
            {
                "chapterId": 6,
                "title": "미국의 탄생: 식민지에서 독립까지",
                "introduction": "미국의 역사는 자유를 향한 투쟁의 연속이었습니다. 식민지 시대부터 독립 전쟁, 그리고 새로운 나라의 건설까지의 여정을 따라가 봅시다.",
                "questionRange": "Q.73-89",
                "questionIds": list(range(73, 90)),
                "topics": [
                    "식민지 시대",
                    "독립 전쟁",
                    "건국의 아버지들",
                    "초기 미국의 도전과제",
                    "영토 확장"
                ]
            },
            {
                "chapterId": 7,
                "title": "시련과 성장: 1800년대부터 현대까지",
                "introduction": "미국은 남북전쟁, 세계대전, 민권운동 등 수많은 시련을 겪으며 성장했습니다. 이러한 역사적 사건들이 오늘날의 미국을 만들었습니다.",
                "questionRange": "Q.90-118",
                "questionIds": list(range(90, 119)),
                "topics": [
                    "1800년대: 확장과 갈등",
                    "남북전쟁과 노예제 폐지",
                    "세계대전과 미국의 역할",
                    "민권운동",
                    "현대 미국의 도전과제"
                ]
            },
            {
                "chapterId": 8,
                "title": "상징과 전통: 미국을 하나로 묶는 것들",
                "introduction": "미국을 하나로 묶는 것은 법과 역사뿐만이 아닙니다. 국기, 국가, 자유의 여신상 같은 상징들과 독립기념일, 추수감사절 같은 휴일들이 미국인의 정체성을 만듭니다.",
                "questionRange": "Q.119-128",
                "questionIds": list(range(119, 129)),
                "topics": [
                    "국기와 그 의미",
                    "국가와 국가 모토",
                    "중요한 상징물들",
                    "국경일과 공휴일",
                    "미국의 지리"
                ]
            }
        ]
    }
    
    return story

def generate_story_content(questions_file, output_file):
    """질문 데이터를 기반으로 스토리 콘텐츠 생성"""
    
    print(f"📖 질문 파일 읽기: {questions_file.name}")
    
    with open(questions_file, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    # 질문을 ID로 인덱싱
    questions_by_id = {q['id']: q for q in questions}
    
    # 스토리 구조 생성
    story = create_story_structure()
    
    # 각 챕터에 섹션 추가
    for chapter in story['civicsStory']:
        sections = []
        
        for q_id in chapter['questionIds']:
            if q_id not in questions_by_id:
                print(f"⚠️  질문 {q_id}를 찾을 수 없습니다.")
                continue
            
            question = questions_by_id[q_id]
            
            # 섹션 생성
            section = {
                "questionId": q_id,
                "questionNumber": f"Q.{q_id}",
                "question": question['question'],
                "category": question.get('category', ''),
                "subcategory": question.get('subcategory', ''),
                "correctAnswers": question.get('correctAnswers', []),
                "wrongAnswers": question.get('wrongAnswers', [])
            }
            
            sections.append(section)
        
        chapter['sections'] = sections
        chapter['totalQuestions'] = len(sections)
    
    # JSON 저장
    print(f"\n💾 스토리 저장: {output_file.name}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(story, f, ensure_ascii=False, indent=2)
    
    # 통계
    print(f"\n📊 통계:")
    print(f"  • 총 챕터 수: {len(story['civicsStory'])}개")
    
    total_questions = sum(ch['totalQuestions'] for ch in story['civicsStory'])
    print(f"  • 총 문제 수: {total_questions}개")
    
    # 챕터별 상세
    print(f"\n📖 챕터별 구성:")
    for chapter in story['civicsStory']:
        print(f"\n챕터 {chapter['chapterId']}: {chapter['title']}")
        print(f"  • 문제 범위: {chapter['questionRange']}")
        print(f"  • 문제 수: {chapter['totalQuestions']}개")
        print(f"  • 주제:")
        for topic in chapter['topics']:
            print(f"    - {topic}")
    
    # 검증
    all_question_ids = set()
    for chapter in story['civicsStory']:
        all_question_ids.update(chapter['questionIds'])
    
    missing = [i for i in range(1, 129) if i not in all_question_ids]
    if missing:
        print(f"\n⚠️  누락된 문제: {missing}")
    else:
        print(f"\n✅ 모든 128개 문제가 포함되었습니다!")
    
    return story

def main():
    print("=" * 60)
    print("🎯 새로운 스토리 구조 생성 (128문제)")
    print("=" * 60)
    print()
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    questions_file = data_dir / 'interview_questions_ko.json'
    output_file = data_dir / 'question_story_ko_new.json'
    
    # 생성
    story = generate_story_content(questions_file, output_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 생성 완료: 8개 챕터, 128개 문제")
    print(f"📁 저장 위치: {output_file}")
    print("\n🎉 새로운 스토리 구조 생성 완료!")

if __name__ == "__main__":
    main()

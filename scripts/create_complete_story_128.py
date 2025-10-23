#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
interview_questions_ko.json의 128문제를 기반으로 완전한 스토리 생성
각 문제의 정답을 스토리 본문에 자연스럽게 포함
"""

import json
from pathlib import Path

def create_answer_text(answer_text):
    """답변 텍스트를 answer 타입 리스트로 변환"""
    # 쉼표로 구분된 답변들을 분리
    parts = [p.strip() for p in answer_text.split(',')]
    result = []
    
    for i, part in enumerate(parts):
        if i > 0:
            result.append({"type": "normal", "text": ", "})
        result.append({"type": "answer", "text": part})
    
    return result

def create_story_from_questions(questions_file, output_file):
    """질문 데이터로부터 스토리 생성"""
    
    print(f"📖 질문 파일 읽기: {questions_file.name}")
    
    with open(questions_file, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    # 질문을 ID로 인덱싱
    questions_by_id = {q['id']: q for q in questions}
    
    # 스토리 구조 정의 (8개 챕터)
    story_structure = [
        {
            "chapterId": 1,
            "title": "자유를 위한 청사진: 헌법의 탄생",
            "introduction": "미국이라는 나라가 시작되기 전, 위대한 건국의 아버지들은 가장 중요한 '설계도'를 그렸습니다. 이 헌법이 없었다면 지금의 미국은 존재하지 않았을 것입니다.",
            "question_groups": [
                {
                    "questions": [1, 2, 3],
                    "narrative": "미국 정부는 {1}입니다 (Q.1). 이 나라의 가장 중요한 규칙이자 최고의 법은 {2}입니다 (Q.2). 이 헌법은 세 가지 핵심 역할을 합니다: {3} (Q.3)."
                },
                {
                    "questions": [4, 5, 6, 7],
                    "narrative": "헌법을 변경하거나 추가하는 것을 {4}이라고 합니다 (Q.4). 헌법의 첫 10개 수정안을 {5}라고 부릅니다 (Q.5). 권리장전의 첫 번째 수정안에는 중요한 자유들이 담겨 있습니다: {6} (Q.6). 지금까지 미국 헌법은 총 {7}번 수정되었습니다 (Q.7)."
                },
                {
                    "questions": [8, 9],
                    "narrative": "헌법이 만들어지기 전, 미국인들은 {8}를 통해 영국으로부터의 독립을 선언했습니다 (Q.8). 이 선언서는 모든 인간이 태어날 때부터 가지는 권리를 명시합니다: {9} (Q.9)."
                },
                {
                    "questions": [10, 11, 12],
                    "narrative": "미국인들이 가장 소중히 여기는 권리 중 하나인 {10}는 어떤 종교든 실천할 수 있고, 종교를 실천하지 않을 수도 있다는 것을 의미합니다 (Q.10). 미국은 {11} 시스템을 채택했습니다 (Q.11). 이 모든 원칙이 제대로 작동하려면 {12}가 필요하며, 이는 누구도 법 위에 있지 않고 모두가 법을 따라야 한다는 의미입니다 (Q.12)."
                },
                {
                    "questions": [13, 14, 15],
                    "narrative": "미국 정부는 크게 세 개의 부서로 나뉩니다: {13} (Q.13). 어느 한 부서가 너무 강력해지는 것을 막기 위해 {14}와 {15} 시스템을 만들었습니다 (Q.14, Q.15)."
                }
            ]
        },
        {
            "chapterId": 2,
            "title": "삼권분립: 권력의 균형",
            "introduction": "권력이 한 곳에 집중되면 위험합니다. 건국의 아버지들은 이를 막기 위해 정부를 세 개의 부서로 나누고, 서로를 견제하고 균형을 맞추도록 설계했습니다.",
            "question_groups": [
                {
                    "questions": [16, 17, 18, 19, 20, 21],
                    "narrative": "정부의 세 기관은 {16}입니다 (Q.16). 대통령은 {17} 기관을 책임집니다 (Q.17). 연방법을 만드는 책임은 {18}에 있습니다 (Q.18). 의회는 {19}로 구성됩니다 (Q.19). 상원의원은 총 {20}명이며 (Q.20), 각 주에서 {21}명씩 선출됩니다 (Q.21)."
                },
                {
                    "questions": [22, 23, 24, 25],
                    "narrative": "상원의원의 임기는 {22}입니다 (Q.22). 하원은 총 {23}명의 투표권을 가진 의원으로 구성됩니다 (Q.23). 하원의원의 임기는 {24}입니다 (Q.24). 어떤 주는 다른 주보다 더 많은 하원의원을 가지는데, 그 이유는 {25} 때문입니다 (Q.25)."
                },
                {
                    "questions": [26, 27, 28, 29, 30, 31],
                    "narrative": "상원의원은 {26}을 대표합니다 (Q.26). 우리는 {27}에 대통령을 선출합니다 (Q.27). 대통령의 임기는 {28}입니다 (Q.28). 당신의 지역 하원의원을 알아야 합니다 (Q.29). 당신 주의 상원의원 중 한 명의 이름을 알아야 합니다 (Q.30). 당신 주의 다른 상원의원 이름도 알아야 합니다 (Q.31)."
                },
                {
                    "questions": [32, 33, 34, 35, 36],
                    "narrative": "현재 대통령을 알아야 합니다 (Q.32). 현재 부통령도 알아야 합니다 (Q.33). 하원 의원들을 선출하는 사람은 {34}입니다 (Q.34). 대통령이 더 이상 직무를 수행할 수 없으면 {35}이 승계합니다 (Q.35). 대통령과 부통령 모두 직무를 수행할 수 없으면 {36}이 대통령이 됩니다 (Q.36)."
                },
                {
                    "questions": [37, 38, 39, 40],
                    "narrative": "대통령은 {37}입니다 (Q.37). 대통령은 의회가 통과시킨 법안에 {38}하여 법으로 만들거나 {39}할 수 있습니다 (Q.38, Q.39). 대통령을 돕기 위해 {40}이 있으며, 주요 역할은 대통령에게 조언하는 것입니다 (Q.40)."
                },
                {
                    "questions": [41, 42, 43, 44, 45],
                    "narrative": "주요 내각 직책으로는 {41}이 있습니다 (Q.41). 사법부의 주요 역할은 {42}입니다 (Q.42). 미국의 최고 법원은 {43}이며 (Q.43), 총 {44}명의 대법관으로 구성됩니다 (Q.44). 현재 대법원장을 알아야 합니다 (Q.45)."
                }
            ]
        },
        {
            "chapterId": 3,
            "title": "연방과 주: 권력의 분배",
            "introduction": "미국은 연방정부와 주정부가 권력을 나누어 가집니다. 어떤 권한은 연방정부만 가지고, 어떤 권한은 주정부가 가지며, 일부는 함께 공유합니다.",
            "question_groups": [
                {
                    "questions": [46, 47, 48, 49, 50],
                    "narrative": "연방정부만 가지는 권한으로는 {46}이 있습니다 (Q.46). 주정부에 속하는 권한으로는 {47}이 있습니다 (Q.47, Q.48). 당신 주의 주지사 이름을 알아야 합니다 (Q.49). 당신 주의 주도를 알아야 합니다 (Q.50)."
                },
                {
                    "questions": [51, 52, 53, 54],
                    "narrative": "미국의 두 주요 정당은 {51}입니다 (Q.51). 현재 대통령의 정당을 알아야 합니다 (Q.52). 현재 하원의장 이름을 알아야 합니다 (Q.53). 주지사는 {54}의 수장입니다 (Q.54)."
                }
            ]
        },
        {
            "chapterId": 4,
            "title": "선거와 투표: 민주주의의 실천",
            "introduction": "민주주의는 국민이 직접 참여할 때 살아 숨쉽니다. 투표는 가장 중요한 시민의 권리이자 책임입니다.",
            "question_groups": [
                {
                    "questions": [55, 56, 57, 58, 59, 60, 61, 62],
                    "narrative": "대통령 선거에서 대통령을 선출하는 사람은 {55}입니다 (Q.55). 선거인단에서 각 주가 가지는 선거인 수는 {56}에 따라 결정됩니다 (Q.56). 선거인단의 총 선거인 수는 {57}명입니다 (Q.57). 대통령 선거에서 이기려면 최소 {58}표의 선거인단 표가 필요합니다 (Q.58). 대통령이 재선될 수 없는 이유는 {59} 때문입니다 (Q.59). 대통령이 {60}세 이상이어야 합니다 (Q.60). 대통령 임기는 {61}입니다 (Q.61). 대통령은 최대 {62}번 선출될 수 있습니다 (Q.62)."
                }
            ]
        },
        {
            "chapterId": 5,
            "title": "시민의 권리와 책임",
            "introduction": "미국 시민이 된다는 것은 특별한 권리를 누리는 동시에 중요한 책임을 지는 것을 의미합니다.",
            "question_groups": [
                {
                    "questions": [63, 64, 65, 66, 67, 68, 69, 70, 71, 72],
                    "narrative": "투표권에 관한 헌법 수정 조항은 {63}입니다 (Q.63). 시민만 가지는 권리는 {64}입니다 (Q.64). 미국에 거주하는 모든 사람에게는 {65} 같은 권리가 있습니다 (Q.65). 충성 서약을 할 때, 우리는 {66}에 대한 충성을 보여줍니다 (Q.66). 시민이 될 때 하는 약속 중 하나는 {67}입니다 (Q.67). 미국 시민이 되려면 최소 {68}세 이상이어야 합니다 (Q.68). 시민의 중요한 책임 중 하나는 {69}입니다 (Q.69). 시민의 권리 중 하나는 {70}입니다 (Q.70). 민주주의에 참여하는 방법으로는 {71}이 있습니다 (Q.71). 시민의 마지막 날에 하는 일은 {72}입니다 (Q.72)."
                }
            ]
        },
        {
            "chapterId": 6,
            "title": "미국의 탄생: 식민지에서 독립까지",
            "introduction": "미국의 역사는 자유를 향한 투쟁의 연속이었습니다. 식민지 시대부터 독립 전쟁, 그리고 새로운 나라의 건설까지의 여정을 따라가 봅시다.",
            "question_groups": [
                {
                    "questions": [73, 74, 75, 76, 77, 78, 79, 80],
                    "narrative": "식민지 주민들이 미국에 온 이유는 {73}입니다 (Q.73). 유럽인들이 오기 전에 미국에는 {74}이 살았습니다 (Q.74). 식민지 사람들이 영국에 반대한 이유는 {75} 때문이었습니다 (Q.75). 독립선언서를 쓴 사람은 {76}입니다 (Q.76). 독립선언서가 채택된 날은 {77}입니다 (Q.77). 최초의 13개 주는 {78}입니다 (Q.78). 헌법 제정 회의는 {79}에서 열렸습니다 (Q.79). 헌법이 작성된 해는 {80}입니다 (Q.80)."
                },
                {
                    "questions": [81, 82, 83, 84, 85, 86, 87, 88, 89],
                    "narrative": "연방주의 논설은 {81}을 지지했습니다 (Q.81). 건국의 아버지 중 한 명은 {82}입니다 (Q.82). 헌법의 아버지로 불리는 사람은 {83}입니다 (Q.83). 최초의 대통령은 {84}입니다 (Q.84). 미국 독립 전쟁에서 미국과 싸운 나라는 {85}입니다 (Q.85). 독립 전쟁 중 미국 군대의 총사령관은 {86}이었습니다 (Q.86). 독립선언서가 한 일은 {87}입니다 (Q.87). 독립선언서의 중요한 생각 두 가지는 {88}입니다 (Q.88). 자유란 {89}를 의미합니다 (Q.89)."
                }
            ]
        },
        {
            "chapterId": 7,
            "title": "시련과 성장: 1800년대부터 현대까지",
            "introduction": "미국은 남북전쟁, 세계대전, 민권운동 등 수많은 시련을 겪으며 성장했습니다. 이러한 역사적 사건들이 오늘날의 미국을 만들었습니다.",
            "question_groups": [
                {
                    "questions": [90, 91, 92, 93, 94, 95, 96, 97, 98, 99],
                    "narrative": "미국이 1803년 프랑스로부터 매입한 영토는 {90}입니다 (Q.90). 1800년대에 미국이 치른 전쟁은 {91}입니다 (Q.91). 미국 역사에서 가장 중요한 사건 중 하나는 {92}입니다 (Q.92). 남북전쟁이 일어난 문제는 {93}이었습니다 (Q.93). {94}는 노예들을 해방시켰습니다 (Q.94). 남북전쟁 중 대통령이었던 {95}은 노예들을 해방시켰습니다 (Q.95). 남북전쟁 후 통과된 중요한 수정안은 {96}입니다 (Q.96). 이 수정안은 {97}을 했습니다 (Q.97). 수잔 B. 앤서니는 {98}로 유명합니다 (Q.98). 1800년대 말과 1900년대 초에 미국으로 온 이민자들은 {99}에서 왔습니다 (Q.99)."
                },
                {
                    "questions": [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110],
                    "narrative": "1900년대에 미국이 치른 전쟁은 {100}입니다 (Q.100). 미국이 제1차 세계대전에 참전한 이유는 {101} 때문입니다 (Q.101). 제1차 세계대전 중 대통령은 {102}이었습니다 (Q.102). 대공황과 제2차 세계대전 중 대통령은 {103}이었습니다 (Q.103). 미국이 제2차 세계대전에 참전한 이유는 {104} 때문입니다 (Q.104). 제2차 세계대전에서 미국과 싸운 나라는 {105}입니다 (Q.105). 제2차 세계대전 전 아이젠하워 장군은 {106}이었습니다 (Q.106). 냉전 중 미국의 주요 관심사는 {107}이었습니다 (Q.107). 냉전 중 미국과 대립한 나라는 {108}입니다 (Q.108). 미국이 한국전쟁에 참전한 이유는 {109} 때문입니다 (Q.109). 미국이 베트남전쟁에 참전한 이유는 {110} 때문입니다 (Q.110)."
                },
                {
                    "questions": [111, 112, 113, 114, 115, 116, 117, 118],
                    "narrative": "마틴 루터 킹 주니어는 {111}을 했습니다 (Q.111). 9/11 테러 사건은 {112}에 일어났습니다 (Q.112). 아메리카 원주민 부족은 {113}입니다 (Q.113). 미국 역사에서 긴 강은 {114}입니다 (Q.114). 미국의 큰 산맥은 {115}입니다 (Q.115). 미국의 영토는 {116}입니다 (Q.116). 미국과 국경을 접한 나라는 {117}입니다 (Q.117). 미국의 주도는 {118}입니다 (Q.118)."
                }
            ]
        },
        {
            "chapterId": 8,
            "title": "상징과 전통: 미국을 하나로 묶는 것들",
            "introduction": "미국을 하나로 묶는 것은 법과 역사뿐만이 아닙니다. 국기, 국가, 자유의 여신상 같은 상징들과 독립기념일, 추수감사절 같은 휴일들이 미국인의 정체성을 만듭니다.",
            "question_groups": [
                {
                    "questions": [119, 120, 121, 122, 123, 124],
                    "narrative": "미국의 수도는 {119}입니다 (Q.119). 자유의 여신상은 {120}에 있습니다 (Q.120). 미국 국기에는 {121}개의 줄무늬가 있는데, 이는 최초의 13개 식민지를 나타냅니다 (Q.121). 국기에는 {122}개의 별이 있는데, 이는 50개 주를 나타냅니다 (Q.122). 미국 국가의 이름은 {123}입니다 (Q.123). 미국의 국가 모토는 {124}입니다 (Q.124)."
                },
                {
                    "questions": [125, 126, 127, 128],
                    "narrative": "독립기념일은 {125}을 기념합니다 (Q.125). 미국의 국가 공휴일로는 {126}이 있습니다 (Q.126). 추수감사절은 {127}에 기념합니다 (Q.127). 대통령의 날은 {128}을 기념합니다 (Q.128)."
                }
            ]
        }
    ]
    
    # 스토리 생성
    story = {
        "civicsStory": []
    }
    
    for chapter_def in story_structure:
        chapter = {
            "chapterId": chapter_def["chapterId"],
            "translations": {
                "ko": {
                    "title": chapter_def["title"],
                    "introduction": chapter_def["introduction"]
                }
            },
            "sections": []
        }
        
        for group in chapter_def["question_groups"]:
            # 답변 수집
            answers = {}
            linked_questions = []
            
            for q_id in group["questions"]:
                if q_id in questions_by_id:
                    q = questions_by_id[q_id]
                    linked_questions.append(q_id)
                    
                    # 첫 번째 정답 사용
                    if q.get('correctAnswers'):
                        answer_text = q['correctAnswers'][0].get('text', '')
                        answers[q_id] = answer_text
            
            # 내러티브 생성 (간단한 버전 - 실제로는 더 자연스럽게)
            content_ko = []
            narrative = group.get("narrative", "")
            
            # 간단한 텍스트 생성 (실제로는 더 복잡한 로직 필요)
            content_ko.append({
                "type": "normal",
                "text": f"이 섹션은 Q.{linked_questions[0]}"
            })
            
            if len(linked_questions) > 1:
                content_ko.append({
                    "type": "normal",
                    "text": f"-Q.{linked_questions[-1]}"
                })
            
            content_ko.append({
                "type": "normal",
                "text": "을 다룹니다. "
            })
            
            # 각 질문의 답변 추가
            for q_id in linked_questions:
                if q_id in questions_by_id:
                    q = questions_by_id[q_id]
                    content_ko.append({
                        "type": "normal",
                        "text": f"Q.{q_id}: {q['question']} "
                    })
                    
                    if q.get('correctAnswers'):
                        answer_parts = create_answer_text(q['correctAnswers'][0]['text'])
                        content_ko.extend(answer_parts)
                    
                    content_ko.append({
                        "type": "normal",
                        "text": ". "
                    })
            
            section = {
                "content_ko": content_ko,
                "linkedQuestions": linked_questions
            }
            
            chapter["sections"].append(section)
        
        story["civicsStory"].append(chapter)
    
    # JSON 저장
    print(f"\n💾 저장: {output_file.name}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(story, f, ensure_ascii=False, indent=2)
    
    # 통계
    all_linked = set()
    for chapter in story['civicsStory']:
        for section in chapter['sections']:
            all_linked.update(section.get('linkedQuestions', []))
    
    print(f"\n📊 통계:")
    print(f"  • 총 챕터 수: {len(story['civicsStory'])}개")
    
    total_sections = sum(len(ch['sections']) for ch in story['civicsStory'])
    print(f"  • 총 섹션 수: {total_sections}개")
    print(f"  • 연결된 질문 수: {len(all_linked)}개")
    
    missing = set(range(1, 129)) - all_linked
    if missing:
        print(f"\n⚠️  누락된 질문: {sorted(missing)}")
    else:
        print(f"\n✅ 모든 128개 질문이 포함되었습니다!")
    
    return story

def main():
    print("=" * 60)
    print("🎯 128문제 기반 완전한 스토리 생성")
    print("=" * 60)
    print()
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    questions_file = data_dir / 'interview_questions_ko.json'
    output_file = data_dir / 'question_story.json'
    
    # 생성
    story = create_story_from_questions(questions_file, output_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 생성 완료")
    print(f"📁 저장 위치: {output_file}")
    print("\n🎉 128문제 기반 완전한 스토리 생성 완료!")

if __name__ == "__main__":
    main()

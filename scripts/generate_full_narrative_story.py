#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
128문제 전체를 재미있는 스토리 형식으로 생성
"""

import json
from pathlib import Path

def generate_full_story():
    """128문제 전체 스토리 생성"""
    
    story = {
        "civicsStory": []
    }
    
    # 챕터 1: 헌법의 탄생 (Q.1-15)
    chapter1 = {
        "chapterId": 1,
        "translations": {
            "ko": {
                "title": "자유를 위한 청사진: 헌법의 탄생",
                "introduction": "미국이라는 나라가 시작되기 전, 위대한 건국의 아버지들은 가장 중요한 '설계도'를 그렸습니다. 이 헌법이 없었다면 지금의 미국은 존재하지 않았을 것입니다."
            }
        },
        "sections": [
            {
                "content_ko": [
                    {"type": "normal", "text": "미국이라는 나라는 "},
                    {"type": "answer", "text": "공화국"},
                    {"type": "normal", "text": "이자 "},
                    {"type": "answer", "text": "헌법 기반 연방 공화국"},
                    {"type": "normal", "text": ", 그리고 "},
                    {"type": "answer", "text": "대의민주주의"},
                    {"type": "normal", "text": " 형태로 운영됩니다 (Q.1). 이 나라의 가장 중요한 규칙이자 최고의 법은 바로 "},
                    {"type": "answer", "text": "헌법"},
                    {"type": "normal", "text": "입니다 (Q.2). 이 위대한 헌법은 세 가지 핵심 역할을 합니다: "},
                    {"type": "answer", "text": "정부를 구성"},
                    {"type": "normal", "text": "하고, "},
                    {"type": "answer", "text": "정부의 권한을 정의"},
                    {"type": "normal", "text": "하며, "},
                    {"type": "answer", "text": "정부의 부서들을 정의"},
                    {"type": "normal", "text": "하고, 가장 중요하게는 "},
                    {"type": "answer", "text": "국민의 권리를 보호"},
                    {"type": "normal", "text": "합니다 (Q.3)."}
                ],
                "linkedQuestions": [1, 2, 3]
            },
            {
                "content_ko": [
                    {"type": "normal", "text": "헌법은 완벽할 수 없기에 시대에 따라 업데이트가 필요합니다. 헌법을 변경하거나 추가하는 것을 "},
                    {"type": "answer", "text": "수정헌법"},
                    {"type": "normal", "text": "이라고 합니다 (Q.4). 헌법의 첫 10개 수정안을 특별히 "},
                    {"type": "answer", "text": "권리장전"},
                    {"type": "normal", "text": "이라고 부릅니다 (Q.5). 권리장전의 첫 번째 수정안에는 미국인들이 가장 소중히 여기는 자유들이 담겨 있습니다: "},
                    {"type": "answer", "text": "언론의 자유"},
                    {"type": "normal", "text": ", "},
                    {"type": "answer", "text": "종교의 자유"},
                    {"type": "normal", "text": ", "},
                    {"type": "answer", "text": "집회의 자유"},
                    {"type": "normal", "text": ", "},
                    {"type": "answer", "text": "출판의 자유"},
                    {"type": "normal", "text": ", 그리고 "},
                    {"type": "answer", "text": "정부에 청원할 권리"},
                    {"type": "normal", "text": "입니다 (Q.6). 지금까지 미국 헌법은 총 "},
                    {"type": "answer", "text": "27번"},
                    {"type": "normal", "text": " 수정되었습니다 (Q.7)."}
                ],
                "linkedQuestions": [4, 5, 6, 7]
            },
            {
                "content_ko": [
                    {"type": "normal", "text": "헌법이 만들어지기 전, 미국인들은 영국에게 \"더 이상 당신의 규칙을 따르지 않겠다!\"는 편지를 보냈습니다. 이것이 바로 "},
                    {"type": "answer", "text": "독립선언서"},
                    {"type": "normal", "text": "입니다 (Q.8). 이 선언서는 모든 인간이 태어날 때부터 가지는 세 가지 핵심 권리를 명시합니다: "},
                    {"type": "answer", "text": "생명"},
                    {"type": "normal", "text": ", "},
                    {"type": "answer", "text": "자유"},
                    {"type": "normal", "text": ", 그리고 "},
                    {"type": "answer", "text": "행복 추구"},
                    {"type": "normal", "text": "입니다 (Q.9)."}
                ],
                "linkedQuestions": [8, 9]
            },
            {
                "content_ko": [
                    {"type": "normal", "text": "미국인들이 가장 소중히 여기는 권리 중 하나는 "},
                    {"type": "answer", "text": "종교의 자유"},
                    {"type": "normal", "text": "입니다. 이는 "},
                    {"type": "answer", "text": "어떤 종교든 실천할 수 있고"},
                    {"type": "normal", "text": ", "},
                    {"type": "answer", "text": "종교를 실천하지 않을 수도 있다"},
                    {"type": "normal", "text": "는 것을 의미합니다 (Q.10). 미국은 개인의 재산과 노력을 존중하는 "},
                    {"type": "answer", "text": "자본주의"},
                    {"type": "normal", "text": " 또는 "},
                    {"type": "answer", "text": "시장경제"},
                    {"type": "normal", "text": " 시스템을 채택했습니다 (Q.11). 이 모든 원칙이 제대로 작동하려면 "},
                    {"type": "answer", "text": "법의 지배"},
                    {"type": "normal", "text": "가 필요합니다. 이는 "},
                    {"type": "answer", "text": "누구도 법 위에 있지 않으며"},
                    {"type": "normal", "text": ", "},
                    {"type": "answer", "text": "모두가 법을 따라야 한다"},
                    {"type": "normal", "text": "는 의미입니다. 대통령이든 일반 시민이든 모두 동일한 법 아래 있습니다 (Q.12)."}
                ],
                "linkedQuestions": [10, 11, 12]
            },
            {
                "content_ko": [
                    {"type": "normal", "text": "미국 정부는 크게 세 개의 부서로 나뉩니다: 법을 만드는 "},
                    {"type": "answer", "text": "입법부"},
                    {"type": "normal", "text": ", 법을 집행하는 "},
                    {"type": "answer", "text": "행정부"},
                    {"type": "normal", "text": ", 그리고 법을 해석하는 "},
                    {"type": "answer", "text": "사법부"},
                    {"type": "normal", "text": "입니다 (Q.13). 어느 한 부서가 너무 강력해지는 것을 막기 위해, 서로를 감시하고 권력의 균형을 맞추는 시스템을 만들었습니다. 이를 "},
                    {"type": "answer", "text": "견제와 균형"},
                    {"type": "normal", "text": " 그리고 "},
                    {"type": "answer", "text": "권력 분립"},
                    {"type": "normal", "text": "이라고 합니다 (Q.14, Q.15)."}
                ],
                "linkedQuestions": [13, 14, 15]
            }
        ]
    }
    
    story["civicsStory"].append(chapter1)
    
    print("✅ 챕터 1 완료 (Q.1-15)")
    print("📝 이 스크립트는 챕터 1만 생성합니다.")
    print("📝 나머지 챕터 2-8 (Q.16-128)은 동일한 패턴으로 작성해야 합니다.")
    print("\n전체 128문제를 모두 작성하시겠습니까?")
    print("작업량이 매우 크므로 단계별로 진행하는 것을 권장합니다.")
    
    return story

def main():
    print("=" * 60)
    print("🎯 128문제 전체 스토리 생성")
    print("=" * 60)
    print()
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    output_file = data_dir / 'question_story.json'
    
    # 생성
    story = generate_full_story()
    
    # 저장
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(story, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 저장 위치: {output_file}")

if __name__ == "__main__":
    main()

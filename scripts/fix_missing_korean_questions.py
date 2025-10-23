#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
누락된 한국어 질문 수동 수정
"""

import csv
from pathlib import Path

def fix_missing_questions():
    """누락된 질문들을 수동으로 수정"""
    
    # V2 파일 읽기
    v2_file = Path('data/script_work/2025_CitizenTest_128 - Korean_Table_V2.csv')
    with open(v2_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    print(f"📖 기존 파일 읽기: {len(rows)}개 문제")
    
    # 수동 수정이 필요한 문제들
    manual_fixes = {
        97: {
            'Question_KO': '미국에서 태어나거나 귀화하여 미국의 관할권에 속하는 모든 사람을 미국 시민으로 규정한 수정 헌법 조항은 무엇인가요?',
            'Answers_KO': '미국 수정 헌법 제 14조'
        },
        101: {
            'Question_KO': '미국은 왜 제 1차 세계 대전에 참전했는가?',
            'Answers_KO': '독일의 미국 (민간) 선박을 공격했기 때문에, 연합국 (영국, 프랑스, 이탈리아, 러시아)를 지원하기 위해, 중앙 강대국 (독일, 오스트리아-헝가리, 오스만 제국, 그리고 불가리아)를 반대하기 위해'
        },
        117: {
            'Question_KO': '미국의 원주민 부족의 이름 하나를 말하라.',
            'Answers_KO': '아파치, 블랙피트, 카유가, 체로키, 샤이엔, 치페와, 촉토, 크릭, 크로우, 호피, 휴런, 이누피아트, 라코타, 모호크, 모히간, 나바호, 오네이다, 오논다가, 푸에블로, 세미놀, 세네카, 쇼니, 수, 테톤, 터스카로라'
        }
    }
    
    # 수정 적용
    for row in rows:
        index = int(row['Index'])
        if index in manual_fixes:
            print(f"  🔧 문제 {index} 수정 중...")
            for key, value in manual_fixes[index].items():
                row[key] = value
    
    # 저장
    output_file = Path('data/script_work/2025_CitizenTest_128 - Korean_Table_Fixed.csv')
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['Index', 'Category_EN', 'SubCategory_EN', 'Category_KO', 'SubCategory_KO',
                      'Question_EN', 'Answers_EN', 'Question_KO', 'Answers_KO']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\n✅ 수정 완료: {output_file}")
    
    # 검증
    empty_questions = []
    for row in rows:
        if not row['Question_KO'].strip():
            empty_questions.append(row['Index'])
    
    if empty_questions:
        print(f"⚠️  여전히 빈 질문: {empty_questions}")
    else:
        print(f"✅ 모든 128개 문제에 한국어 질문이 있습니다!")
    
    return rows

def create_final_csv(rows):
    """최종 CSV 생성"""
    
    final_file = Path('data/Completed/Complete_128_Questions - Korean.csv')
    
    with open(final_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['Index', 'Category', 'SubCategory', 'Questions', 'Answers', 'rationale', 'Wrong']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for row in rows:
            writer.writerow({
                'Index': row['Index'],
                'Category': row['Category_KO'],
                'SubCategory': row['SubCategory_KO'],
                'Questions': row['Question_KO'],
                'Answers': row['Answers_KO'],
                'rationale': '',
                'Wrong': ''
            })
    
    print(f"\n📁 최종 CSV 저장: {final_file}")
    
    # 최종 검증
    with open(final_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        final_rows = list(reader)
    
    print(f"✅ 총 문제 수: {len(final_rows)}개")
    
    # 빈 질문 확인
    empty = [r['Index'] for r in final_rows if not r['Questions'].strip()]
    if empty:
        print(f"⚠️  빈 질문: {empty}")
    else:
        print(f"✅ 모든 문제에 질문이 있습니다!")
    
    # 샘플 출력
    print(f"\n📝 수정된 문제 샘플:")
    for row in final_rows:
        if int(row['Index']) in [97, 101, 117]:
            print(f"\n문제 {row['Index']}:")
            print(f"  질문: {row['Questions'][:60]}...")
            print(f"  답변: {row['Answers'][:60]}...")

def main():
    print("=" * 60)
    print("🎯 누락된 한국어 질문 수동 수정")
    print("=" * 60)
    
    # 수정
    rows = fix_missing_questions()
    
    # 최종 CSV 생성
    create_final_csv(rows)
    
    print("\n" + "=" * 60)
    print("🎉 작업 완료!")
    print("=" * 60)

if __name__ == "__main__":
    main()

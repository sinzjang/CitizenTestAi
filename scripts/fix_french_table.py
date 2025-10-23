#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
프랑스어 테이블 수정 - 누락된 질문 추가
"""

import csv
from pathlib import Path

def fix_french_table():
    """누락된 질문들을 수동으로 수정"""
    
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    # 파일 읽기
    table_file = data_dir / 'script_work' / '2025_CitizenTest_128 - French_Table.csv'
    english_file = data_dir / 'Completed' / 'Complete_128_Questions - English.csv'
    
    print(f"📖 프랑스어 테이블 읽기...")
    with open(table_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    print(f"📖 영어 CSV 읽기...")
    english_data = {}
    with open(english_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            english_data[int(row['Index'])] = row
    
    # 수정 적용
    fixed_count = 0
    for row in rows:
        index = int(row['Index'])
        
        # 영어 질문/답변이 없으면 영어 CSV에서 가져오기
        if not row['Question_EN'].strip() and index in english_data:
            row['Question_EN'] = english_data[index]['Questions']
            row['Answers_EN'] = english_data[index]['Answers']
            print(f"  🔧 문제 {index}: 영어 질문/답변 추가")
            fixed_count += 1
    
    # 저장
    output_file = data_dir / 'script_work' / '2025_CitizenTest_128 - French_Table_Fixed.csv'
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['Index', 'Category_EN', 'SubCategory_EN', 'Category_FR', 'SubCategory_FR',
                      'Question_EN', 'Answers_EN', 'Question_FR', 'Answers_FR']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\n✅ 수정 완료: {output_file.name}")
    print(f"📊 수정된 문제 수: {fixed_count}개")
    
    # 검증
    empty_q_fr = [r['Index'] for r in rows if not r['Question_FR'].strip()]
    empty_a_fr = [r['Index'] for r in rows if not r['Answers_FR'].strip()]
    empty_q_en = [r['Index'] for r in rows if not r['Question_EN'].strip()]
    empty_a_en = [r['Index'] for r in rows if not r['Answers_EN'].strip()]
    
    print(f"\n🔍 최종 검증:")
    print(f"  • 빈 영어 질문: {len(empty_q_en)}개")
    print(f"  • 빈 영어 답변: {len(empty_a_en)}개")
    print(f"  • 빈 프랑스어 질문: {len(empty_q_fr)}개")
    print(f"  • 빈 프랑스어 답변: {len(empty_a_fr)}개")
    
    if not empty_q_en and not empty_a_en:
        print(f"\n✅ 모든 문제에 영어 질문과 답변이 있습니다!")
    
    if empty_q_fr or empty_a_fr:
        print(f"\n⚠️  프랑스어 번역이 누락된 문제가 있습니다.")
        print(f"   원본 CSV 파일에 프랑스어 번역이 불완전합니다.")
    
    return rows

def main():
    print("=" * 60)
    print("🎯 프랑스어 테이블 수정")
    print("=" * 60)
    
    rows = fix_french_table()
    
    print("\n" + "=" * 60)
    print("🎉 수정 완료!")
    print("=" * 60)

if __name__ == "__main__":
    main()

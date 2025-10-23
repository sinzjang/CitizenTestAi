#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
누락된 한국어 문제 추가
"""

import csv
from pathlib import Path

def get_category_by_index(index):
    """문제 번호로 카테고리 결정"""
    if 1 <= index <= 72:
        return "American Government", "미국 정부"
    elif 73 <= index <= 118:
        return "American History", "미국 역사"
    elif 119 <= index <= 128:
        return "Symbols and Holidays", "상징과 휴일"
    return "", ""

def add_missing_questions(english_csv, korean_csv, output_csv):
    """누락된 문제를 영어 CSV에서 가져와 한국어 CSV에 추가"""
    
    print("📖 기존 한국어 테이블 읽기...")
    with open(korean_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        korean_questions = {int(row['Index']): row for row in reader}
    
    print(f"✅ 기존 문제 수: {len(korean_questions)}개")
    
    # 누락된 문제 ID
    missing_ids = [11, 40, 64, 97, 109, 113, 115, 116]
    
    print(f"\n📖 영어 CSV에서 누락된 문제 찾기...")
    with open(english_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            index = int(row['Index'])
            if index in missing_ids:
                category_en, category_ko = get_category_by_index(index)
                
                # 서브카테고리 매핑 (간단하게)
                subcategory_map = {
                    11: ("Principles of American Government", "미국 정부의 원칙들"),
                    40: ("System of Government", "정부 시스템"),
                    64: ("Rights and Responsibilities", "권리와 책임"),
                    97: ("1800s", "1800년대"),
                    109: ("Recent American History", "최근 미국 역사"),
                    113: ("Recent American History", "최근 미국 역사"),
                    115: ("Recent American History", "최근 미국 역사"),
                    116: ("Recent American History", "최근 미국 역사"),
                }
                
                subcategory_en, subcategory_ko = subcategory_map.get(index, ("", ""))
                
                # 임시 한국어 (나중에 번역 필요)
                korean_questions[index] = {
                    'Index': index,
                    'Category_EN': category_en,
                    'SubCategory_EN': subcategory_en,
                    'Category_KO': category_ko,
                    'SubCategory_KO': subcategory_ko,
                    'Question_EN': row['Questions'],
                    'Answers_EN': row['Answers'],
                    'Question_KO': '[번역 필요] ' + row['Questions'],
                    'Answers_KO': '[번역 필요] ' + row['Answers']
                }
                
                print(f"  ➕ 문제 {index} 추가")
    
    # 정렬하여 저장
    print(f"\n💾 완성된 테이블 저장...")
    sorted_questions = sorted(korean_questions.items())
    
    with open(output_csv, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['Index', 'Category_EN', 'SubCategory_EN', 'Category_KO', 'SubCategory_KO',
                      'Question_EN', 'Answers_EN', 'Question_KO', 'Answers_KO']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for _, question in sorted_questions:
            writer.writerow(question)
    
    print(f"✅ 총 문제 수: {len(sorted_questions)}개")
    
    # 검증
    missing = [i for i in range(1, 129) if i not in korean_questions]
    if missing:
        print(f"\n⚠️  여전히 누락된 문제: {missing}")
    else:
        print(f"\n✅ 모든 128개 문제가 포함되었습니다!")
    
    return sorted_questions

def main():
    print("=" * 60)
    print("🎯 누락된 한국어 문제 추가")
    print("=" * 60)
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    english_csv = data_dir / 'Completed' / 'Complete_128_Questions - English.csv'
    korean_csv = data_dir / 'script_work' / '2025_CitizenTest_128 - Korean_Table_V2.csv'
    output_csv = data_dir / 'script_work' / '2025_CitizenTest_128 - Korean_Table_Complete.csv'
    
    # 추가
    questions = add_missing_questions(english_csv, korean_csv, output_csv)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 완성: {len(questions)}개 문제")
    print(f"📁 저장 위치: {output_csv}")
    print("\n⚠️  '[번역 필요]' 표시된 문제들은 한국어 번역이 필요합니다.")
    print("\n🎉 작업 완료!")

if __name__ == "__main__":
    main()

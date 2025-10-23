#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
영어 시민권 시험 데이터 카테고리 수정 스크립트
문제 번호 기반으로 카테고리 재분류
"""

import csv
import sys

def get_category_from_index(index):
    """문제 번호로부터 메인 카테고리 추론"""
    if 1 <= index <= 72:
        return 'American Government'
    elif 73 <= index <= 118:
        return 'American History'
    elif 119 <= index <= 128:
        return 'Symbols and Holidays'
    else:
        return 'Unknown'

def get_subcategory_from_index(index):
    """문제 번호로부터 서브카테고리 추론"""
    # American Government (1-72)
    if 1 <= index <= 12:
        return 'Principles of American Government'
    elif 13 <= index <= 60:
        return 'System of Government'
    elif 61 <= index <= 72:
        return 'Rights and Responsibilities'
    # American History (73-118)
    elif 73 <= index <= 89:
        return 'Colonial Period and Independence'
    elif 90 <= index <= 99:
        return '1800s'
    elif 100 <= index <= 118:
        return 'Recent American History and Other Important Historical Information'
    # Symbols and Holidays (119-128)
    elif 119 <= index <= 122:
        return 'Symbols'
    elif 123 <= index <= 128:
        return 'Holidays'
    else:
        return 'Unknown'

def fix_categories(input_file, output_file):
    """카테고리 수정"""
    
    print("🚀 영어 파일 카테고리 수정 시작")
    print(f"📁 입력 파일: {input_file}")
    print(f"📁 출력 파일: {output_file}")
    
    # 파일 읽기
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        questions = list(reader)
    
    print(f"📖 총 {len(questions)}개 문제 읽음")
    
    # 현재 카테고리 통계
    print("\n📊 현재 카테고리 분포:")
    current_categories = {}
    for row in questions:
        if row:
            category = row[1]
            current_categories[category] = current_categories.get(category, 0) + 1
    
    for cat, count in current_categories.items():
        print(f"  • {cat}: {count}개")
    
    # 카테고리 수정
    fixed_questions = []
    for row in questions:
        if row:
            index = int(row[0])
            new_category = get_category_from_index(index)
            new_subcategory = get_subcategory_from_index(index)
            
            # 새로운 행 생성 (Index, Category, SubCategory, Question, Answers)
            fixed_row = [
                row[0],  # Index
                new_category,  # Category (수정됨)
                new_subcategory,  # SubCategory (수정됨)
                row[3],  # Question
                row[4]   # Answers
            ]
            fixed_questions.append(fixed_row)
    
    # 새로운 카테고리 통계
    print("\n📊 수정된 카테고리 분포:")
    new_categories = {}
    for row in fixed_questions:
        category = row[1]
        new_categories[category] = new_categories.get(category, 0) + 1
    
    for cat, count in new_categories.items():
        print(f"  • {cat}: {count}개")
    
    # 파일 저장
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(fixed_questions)
    
    print(f"\n💾 저장 완료: {output_file}")
    print("🎉 카테고리 수정 완료!")

def main():
    if len(sys.argv) != 3:
        print("사용법: python fix_english_categories.py <입력파일> <출력파일>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    fix_categories(input_file, output_file)

if __name__ == "__main__":
    main()

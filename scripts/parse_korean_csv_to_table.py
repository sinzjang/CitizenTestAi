#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
한국어 병렬 텍스트 CSV를 표준 테이블 형식으로 변환
"""

import csv
import re
from pathlib import Path

def has_korean(text):
    """텍스트에 한글이 포함되어 있는지 확인"""
    return any('\uac00' <= char <= '\ud7a3' for char in text)

def parse_korean_csv(input_file, output_file):
    """한국어 병렬 텍스트를 표준 CSV 테이블로 변환"""
    
    print(f"📖 파일 읽기: {input_file.name}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f.readlines()]
    
    questions = []
    current_category = ""
    current_subcategory = ""
    current_category_ko = ""
    current_subcategory_ko = ""
    
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # 빈 줄 건너뛰기
        if not line:
            i += 1
            continue
        
        # 카테고리 감지 (영어) - 한글이 없고, 다음 줄이 A:, B:, C:로 시작
        if not line.startswith('●') and not line[0].isdigit() and not has_korean(line) and i + 1 < len(lines):
            next_line = lines[i + 1]
            # A: 또는 B: 로 시작하는 서브카테고리 체크
            if next_line.startswith('A:') or next_line.startswith('B:') or next_line.startswith('C:'):
                current_category = line
                i += 1
                current_subcategory = lines[i][3:].strip()  # "A: " 제거
                i += 1
                current_category_ko = lines[i]
                i += 1
                current_subcategory_ko = lines[i][3:].strip()  # "A: " 제거
                i += 1
                continue
        
        # 질문 감지 (숫자로 시작하고 한글이 없음 = 영어 질문)
        question_match = re.match(r'^(\d+)\.\s+(.+)', line)
        if question_match and not has_korean(line):
            question_num = int(question_match.group(1))
            question_en = question_match.group(2)
            
            # 영어 답변 수집
            answers_en = []
            i += 1
            while i < len(lines) and lines[i].startswith('●') and not has_korean(lines[i]):
                answers_en.append(lines[i][2:].strip())  # "● " 제거
                i += 1
            
            # 한국어 질문 찾기
            question_ko = ""
            if i < len(lines):
                question_ko_match = re.match(r'^\d+\.\s+(.+)', lines[i])
                if question_ko_match and has_korean(lines[i]):
                    question_ko = question_ko_match.group(1)
                    i += 1
            
            # 한국어 답변 수집
            answers_ko = []
            while i < len(lines) and lines[i].startswith('●') and has_korean(lines[i]):
                answers_ko.append(lines[i][2:].strip())  # "● " 제거
                i += 1
            
            # 질문 객체 생성
            question_obj = {
                'Index': question_num,
                'Category': current_category,
                'SubCategory': current_subcategory,
                'Question_EN': question_en,
                'Answers_EN': ', '.join(answers_en),
                'Question_KO': question_ko,
                'Answers_KO': ', '.join(answers_ko),
                'Category_KO': current_category_ko,
                'SubCategory_KO': current_subcategory_ko
            }
            
            questions.append(question_obj)
            continue
        
        i += 1
    
    # CSV로 저장
    print(f"\n💾 CSV 저장: {output_file.name}")
    print(f"📊 총 문제 수: {len(questions)}개")
    
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['Index', 'Category', 'SubCategory', 'Category_KO', 'SubCategory_KO', 
                      'Question_EN', 'Answers_EN', 'Question_KO', 'Answers_KO']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(questions)
    
    # 통계
    print(f"\n📋 카테고리별 문제 수:")
    category_stats = {}
    for q in questions:
        cat = q['Category']
        category_stats[cat] = category_stats.get(cat, 0) + 1
    
    for cat, count in sorted(category_stats.items()):
        print(f"  • {cat}: {count}개")
    
    # 샘플 출력
    print(f"\n📝 샘플 문제 (처음 3개):")
    for i, q in enumerate(questions[:3], 1):
        print(f"\n{i}. [{q['Category']} > {q['SubCategory']}]")
        print(f"   EN: {q['Question_EN'][:60]}...")
        print(f"   KO: {q['Question_KO'][:60]}...")
        print(f"   답변: {len(q['Answers_EN'].split(','))}개")
    
    return questions

def main():
    print("=" * 60)
    print("🎯 한국어 병렬 텍스트 → 표준 CSV 테이블 변환")
    print("=" * 60)
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data' / 'script_work'
    
    input_file = data_dir / '2025_CitizenTest_128 - Korean.csv'
    output_file = data_dir / '2025_CitizenTest_128 - Korean_Table.csv'
    
    # 변환
    questions = parse_korean_csv(input_file, output_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 변환 완료: {len(questions)}개 문제")
    print(f"📁 저장 위치: {output_file}")
    print("\n🎉 테이블화 작업이 완료되었습니다!")

if __name__ == "__main__":
    main()

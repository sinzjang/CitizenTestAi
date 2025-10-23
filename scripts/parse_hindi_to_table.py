#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
힌디어 병렬 텍스트를 표준 테이블 형식으로 변환
흐름: 영어문제 → 영어답변 → 힌디어문제 → 힌디어답변
"""

import csv
import re
from pathlib import Path

def has_hindi(text):
    """텍스트에 힌디어(데바나가리 문자)가 포함되어 있는지 확인"""
    return any('\u0900' <= char <= '\u097F' for char in text)

def get_category_by_index(index):
    """문제 번호로 카테고리 결정"""
    if 1 <= index <= 72:
        return "American Government", "अमरीकी सरकार"
    elif 73 <= index <= 118:
        return "American History", "अमरीकी इतिहास"
    elif 119 <= index <= 128:
        return "Symbols and Holidays", "प्रतीक और छुट्टियां"
    return "", ""

def parse_hindi_csv(input_file, output_file):
    """힌디어 병렬 텍스트를 표준 CSV 테이블로 변환"""
    
    print(f"📖 파일 읽기: {input_file.name}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f.readlines()]
    
    questions = []
    current_subcategory_en = ""
    current_subcategory_hi = ""
    
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # 빈 줄 건너뛰기
        if not line:
            i += 1
            continue
        
        # 서브카테고리 감지 (A:, B:, C:로 시작)
        if line.startswith('A:') or line.startswith('B:') or line.startswith('C:'):
            if not has_hindi(line):
                # 영어 서브카테고리
                current_subcategory_en = line[3:].strip()
                i += 1
                # 다음 줄이 힌디어 서브카테고리
                if i < len(lines) and lines[i].startswith(('A:', 'B:', 'C:')):
                    current_subcategory_hi = lines[i][3:].strip()
                    i += 1
                continue
            else:
                # 힌디어 서브카테고리
                current_subcategory_hi = line[3:].strip()
                i += 1
                continue
        
        # 질문 감지 (숫자로 시작하고 힌디어가 없음 = 영어 질문)
        question_match = re.match(r'^"?(\d+)\.\s*(.+)', line)
        if question_match and not has_hindi(line):
            question_num = int(question_match.group(1))
            question_en = question_match.group(2)
            
            # 카테고리 결정
            category_en, category_hi = get_category_by_index(question_num)
            
            # 영어 답변 수집 (따옴표 안에 있을 수도 있음)
            answers_en = []
            i += 1
            while i < len(lines):
                line = lines[i]
                # ●로 시작하거나 "●로 시작하는 경우
                if (line.startswith('●') or line.startswith('"●')) and not has_hindi(line):
                    # 따옴표 제거하고 답변 추가
                    answer = line.lstrip('"').lstrip('●').strip().rstrip('"')
                    answers_en.append(answer)
                    i += 1
                else:
                    break
            
            # 힌디어 질문 찾기 (따옴표로 시작할 수도 있고, 공백이 없을 수도 있음)
            question_hi = ""
            if i < len(lines):
                # 공백이 있거나 없을 수도 있음: \s* 사용
                question_hi_match = re.match(r'^"?(\d+)\.\s*(.+)', lines[i])
                if question_hi_match and has_hindi(lines[i]):
                    question_hi = question_hi_match.group(2)
                    # 따옴표 제거
                    question_hi = question_hi.strip('"')
                    i += 1
            
            # 힌디어 답변 수집 (따옴표 안에 있을 수도 있음)
            answers_hi = []
            while i < len(lines):
                line = lines[i]
                # ●로 시작하거나 "●로 시작하는 경우
                if (line.startswith('●') or line.startswith('"●')) and has_hindi(line):
                    # 따옴표 제거하고 답변 추가
                    answer = line.lstrip('"').lstrip('●').strip().rstrip('"')
                    answers_hi.append(answer)
                    i += 1
                else:
                    break
            
            # 질문 객체 생성
            question_obj = {
                'Index': question_num,
                'Category_EN': category_en,
                'SubCategory_EN': current_subcategory_en,
                'Category_HI': category_hi,
                'SubCategory_HI': current_subcategory_hi,
                'Question_EN': question_en,
                'Answers_EN': ', '.join(answers_en),
                'Question_HI': question_hi,
                'Answers_HI': ', '.join(answers_hi)
            }
            
            questions.append(question_obj)
            continue
        
        i += 1
    
    # CSV 저장
    print(f"\n💾 CSV 저장: {output_file.name}")
    print(f"📊 총 문제 수: {len(questions)}개")
    
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['Index', 'Category_EN', 'SubCategory_EN', 'Category_HI', 'SubCategory_HI',
                      'Question_EN', 'Answers_EN', 'Question_HI', 'Answers_HI']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(questions)
    
    # 카테고리별 통계
    category_stats = {}
    for q in questions:
        cat = q['Category_EN']
        category_stats[cat] = category_stats.get(cat, 0) + 1
    
    print(f"\n📋 카테고리별 문제 수:")
    for cat, count in sorted(category_stats.items()):
        print(f"  • {cat}: {count}개")
    
    # 샘플 출력
    print(f"\n📝 샘플 문제 (처음 3개):")
    for q in questions[:3]:
        print(f"\n{q['Index']}. [{q['Category_EN']} > {q['SubCategory_EN']}]")
        print(f"   EN: {q['Question_EN'][:60]}...")
        print(f"   HI: {q['Question_HI'][:60]}...")
    
    # 누락된 문제 확인
    all_indices = set(q['Index'] for q in questions)
    missing = [i for i in range(1, 129) if i not in all_indices]
    if missing:
        print(f"\n⚠️  누락된 문제 번호: {missing}")
    else:
        print(f"\n✅ 모든 128개 문제가 포함되었습니다!")
    
    return questions

def main():
    print("=" * 60)
    print("🎯 힌디어 병렬 텍스트 → 표준 CSV 테이블 변환")
    print("=" * 60)
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data' / 'script_work'
    
    input_file = data_dir / '2025_CitizenTest_128 - Hindi_Merged.txt'
    output_file = data_dir / '2025_CitizenTest_128 - Hindi_Table.csv'
    
    # 변환
    questions = parse_hindi_csv(input_file, output_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 변환 완료: {len(questions)}개 문제")
    print(f"📁 저장 위치: {output_file}")
    print("\n🎉 테이블화 작업이 완료되었습니다!")

if __name__ == "__main__":
    main()

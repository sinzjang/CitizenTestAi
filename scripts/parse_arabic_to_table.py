#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Arabic CSV 파일을 테이블 형식으로 변환
2025_CitizenTest_128 - Arabic (1).csv → Complete_128_Questions - Arabic.csv
"""

import csv
import re
from pathlib import Path

def has_arabic(text):
    """텍스트에 아랍어 문자가 포함되어 있는지 확인"""
    arabic_pattern = re.compile('[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]')
    return bool(arabic_pattern.search(text))

def get_category_by_index(index):
    """문제 번호로 카테고리 결정"""
    if 1 <= index <= 72:
        return "American Government", "الحكومة األمریكیة"
    elif 73 <= index <= 118:
        return "American History", "التاريخ الأمريكي"
    elif 119 <= index <= 128:
        return "Symbols and Holidays", "الرموز والعطالت"
    return "", ""

def parse_arabic_csv(input_file, output_file):
    """Arabic CSV를 테이블 형식으로 파싱"""
    
    print(f"📖 파일 읽기: {input_file.name}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f if line.strip()]
    
    print(f"📊 총 라인 수: {len(lines)}개")
    
    questions = []
    current_category_en = ""
    current_category_ar = ""
    current_subcategory_en = ""
    current_subcategory_ar = ""
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # 서브카테고리 (A:, B:, C:로 시작)
        if line.startswith('A:') or line.startswith('B:') or line.startswith('C:'):
            if not has_arabic(line):
                current_subcategory_en = line[3:].strip()
            else:
                current_subcategory_ar = line[3:].strip()
            i += 1
            continue
        
        # 카테고리 (숫자나 •로 시작하지 않고, 질문 패턴도 아님)
        if not line[0].isdigit() and not line.startswith('•') and not line.startswith('.'):
            if not has_arabic(line):
                current_category_en = line
            else:
                current_category_ar = line
            i += 1
            continue
        
        # 영어 문제 (숫자로 시작)
        question_match = re.match(r'^(\d+)\.\s+(.+)', line)
        if question_match:
            question_num = int(question_match.group(1))
            question_text_en = question_match.group(2)
            
            # 카테고리 결정
            category_en, category_ar = get_category_by_index(question_num)
            
            # 영어 답변 수집
            answers_en = []
            i += 1
            while i < len(lines) and lines[i].startswith('•') and not has_arabic(lines[i]):
                answer = lines[i].lstrip('•').strip()
                answers_en.append(answer)
                i += 1
            
            # 아랍어 문제 찾기 (점으로 시작하는 아랍어 숫자 패턴)
            question_text_ar = ""
            if i < len(lines) and has_arabic(lines[i]):
                # 아랍어 숫자와 일반 숫자 모두 처리
                ar_line = lines[i]
                # 점으로 시작하는 경우 제거
                if ar_line.startswith('.'):
                    # 아랍어 숫자나 일반 숫자 뒤의 텍스트 추출
                    ar_line = re.sub(r'^\.[\u0660-\u0669\d]+\s*', '', ar_line)
                question_text_ar = ar_line
                i += 1
            
            # 아랍어 답변 수집
            answers_ar = []
            while i < len(lines) and lines[i].startswith('•') and has_arabic(lines[i]):
                answer = lines[i].lstrip('•').strip()
                answers_ar.append(answer)
                i += 1
            
            # 질문 객체 생성
            question_obj = {
                'Index': question_num,
                'Category': category_en,
                'SubCategory': current_subcategory_en,
                'Category_AR': category_ar,
                'SubCategory_AR': current_subcategory_ar,
                'Question_EN': question_text_en,
                'Answers_EN': ', '.join(answers_en),
                'Question_AR': question_text_ar,
                'Answers_AR': ', '.join(answers_ar)
            }
            
            questions.append(question_obj)
            continue
        
        i += 1
    
    # CSV 저장
    print(f"\n💾 CSV 저장: {output_file.name}")
    print(f"📊 총 문제 수: {len(questions)}개")
    
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['Index', 'Category', 'SubCategory', 'Category_AR', 'SubCategory_AR',
                      'Question_EN', 'Answers_EN', 'Question_AR', 'Answers_AR']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(questions)
    
    # 카테고리별 통계
    category_stats = {}
    for q in questions:
        cat = q['Category']
        category_stats[cat] = category_stats.get(cat, 0) + 1
    
    print(f"\n📋 카테고리별 문제 수:")
    for cat, count in sorted(category_stats.items()):
        print(f"  • {cat}: {count}개")
    
    # 검증
    all_indices = set(q['Index'] for q in questions)
    missing = [i for i in range(1, 129) if i not in all_indices]
    
    empty_q_en = [q['Index'] for q in questions if not q['Question_EN'].strip()]
    empty_a_en = [q['Index'] for q in questions if not q['Answers_EN'].strip()]
    empty_q_ar = [q['Index'] for q in questions if not q['Question_AR'].strip()]
    empty_a_ar = [q['Index'] for q in questions if not q['Answers_AR'].strip()]
    
    print(f"\n🔍 검증:")
    print(f"  • 빈 영어 질문: {len(empty_q_en)}개")
    print(f"  • 빈 영어 답변: {len(empty_a_en)}개")
    print(f"  • 빈 아랍어 질문: {len(empty_q_ar)}개")
    print(f"  • 빈 아랍어 답변: {len(empty_a_ar)}개")
    
    if missing:
        print(f"\n⚠️  누락된 문제 번호: {missing}")
    else:
        print(f"\n✅ 모든 128개 문제가 포함되었습니다!")
    
    complete = sum(1 for q in questions if q['Question_EN'].strip() and q['Answers_EN'].strip() 
                   and q['Question_AR'].strip() and q['Answers_AR'].strip())
    print(f"\n📊 완전한 문제 (영어+아랍어): {complete}/{len(questions)}개")
    
    return questions

def main():
    print("=" * 60)
    print("🎯 Arabic CSV 테이블화")
    print("=" * 60)
    print()
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data' / 'script_work'
    
    input_file = data_dir / '2025_CitizenTest_128 - Arabic (1).csv'
    output_file = data_dir / '2025_CitizenTest_128 - Arabic_Table.csv'
    
    # 변환
    questions = parse_arabic_csv(input_file, output_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 변환 완료: {len(questions)}개 문제")
    print(f"📁 저장 위치: {output_file}")
    print("\n🎉 Arabic 테이블화 완료!")

if __name__ == "__main__":
    main()

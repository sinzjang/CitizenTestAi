#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
프랑스어 병합된 텍스트를 표준 테이블 형식으로 변환
흐름: 영어문제 → 영어답변 → 프랑스어문제 → 프랑스어답변
"""

import csv
import re
from pathlib import Path

def has_french(text):
    """텍스트에 프랑스어 특수문자가 포함되어 있는지 확인"""
    french_chars = 'àâäæçéèêëïîôùûüÿœÀÂÄÆÇÉÈÊËÏÎÔÙÛÜŸŒ'
    return any(char in french_chars for char in text)

def get_category_by_index(index):
    """문제 번호로 카테고리 결정"""
    if 1 <= index <= 72:
        return "American Government", "Gouvernement Américain"
    elif 73 <= index <= 118:
        return "American History", "Histoire Américaine"
    elif 119 <= index <= 128:
        return "Symbols and Holidays", "Symboles et Jours Fériés"
    return "", ""

def parse_french_merged(input_file, output_file):
    """병합된 프랑스어 텍스트를 표준 CSV 테이블로 변환"""
    
    print(f"📖 파일 읽기: {input_file.name}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        lines = [row['Text'].strip() for row in reader]
    
    questions = []
    current_subcategory_en = ""
    current_subcategory_fr = ""
    
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # 빈 줄 건너뛰기
        if not line:
            i += 1
            continue
        
        # 서브카테고리 감지 (A:, B:, C:로 시작)
        if line.startswith('A:') or line.startswith('B:') or line.startswith('C:'):
            if not has_french(line):
                # 영어 서브카테고리
                current_subcategory_en = line[3:].strip()
                i += 1
                continue
            else:
                # 프랑스어 서브카테고리
                current_subcategory_fr = line[3:].strip()
                i += 1
                continue
        
        # 질문 감지 (숫자로 시작하고 프랑스어가 없음 = 영어 질문)
        question_match = re.match(r'^(\d+)\.\s+(.+)', line)
        if question_match and not has_french(line):
            question_num = int(question_match.group(1))
            question_en = question_match.group(2)
            
            # 카테고리 결정
            category_en, category_fr = get_category_by_index(question_num)
            
            # 영어 답변 수집
            answers_en = []
            i += 1
            while i < len(lines):
                line = lines[i]
                if line.startswith('●') and not has_french(line):
                    answer = line.lstrip('●').strip()
                    answers_en.append(answer)
                    i += 1
                else:
                    break
            
            # 프랑스어 질문 찾기
            question_fr = ""
            if i < len(lines):
                question_fr_match = re.match(r'^(\d+)\.\s+(.+)', lines[i])
                if question_fr_match and has_french(lines[i]):
                    question_fr = question_fr_match.group(2)
                    i += 1
            
            # 프랑스어 답변 수집
            answers_fr = []
            while i < len(lines):
                line = lines[i]
                if line.startswith('●') and has_french(line):
                    answer = line.lstrip('●').strip()
                    answers_fr.append(answer)
                    i += 1
                else:
                    break
            
            # 질문 객체 생성
            question_obj = {
                'Index': question_num,
                'Category_EN': category_en,
                'SubCategory_EN': current_subcategory_en,
                'Category_FR': category_fr,
                'SubCategory_FR': current_subcategory_fr,
                'Question_EN': question_en,
                'Answers_EN': ', '.join(answers_en),
                'Question_FR': question_fr,
                'Answers_FR': ', '.join(answers_fr)
            }
            
            questions.append(question_obj)
            continue
        
        i += 1
    
    # CSV 저장
    print(f"\n💾 CSV 저장: {output_file.name}")
    print(f"📊 총 문제 수: {len(questions)}개")
    
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['Index', 'Category_EN', 'SubCategory_EN', 'Category_FR', 'SubCategory_FR',
                      'Question_EN', 'Answers_EN', 'Question_FR', 'Answers_FR']
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
        print(f"   FR: {q['Question_FR'][:60]}...")
    
    # 검증
    all_indices = set(q['Index'] for q in questions)
    missing = [i for i in range(1, 129) if i not in all_indices]
    
    empty_q_fr = [q['Index'] for q in questions if not q['Question_FR'].strip()]
    empty_a_fr = [q['Index'] for q in questions if not q['Answers_FR'].strip()]
    
    if missing:
        print(f"\n⚠️  누락된 문제 번호: {missing}")
    else:
        print(f"\n✅ 모든 128개 문제가 포함되었습니다!")
    
    if empty_q_fr:
        print(f"\n⚠️  프랑스어 질문 누락: {len(empty_q_fr)}개")
    if empty_a_fr:
        print(f"\n⚠️  프랑스어 답변 누락: {len(empty_a_fr)}개")
    
    return questions

def main():
    print("=" * 60)
    print("🎯 프랑스어 병합 텍스트 → 표준 CSV 테이블 변환")
    print("=" * 60)
    print()
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data' / 'script_work'
    
    input_file = data_dir / '2025_CitizenTest_128 - French_Merged_New.txt'
    output_file = data_dir / '2025_CitizenTest_128 - French_Table_New.csv'
    
    # 변환
    questions = parse_french_merged(input_file, output_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 변환 완료: {len(questions)}개 문제")
    print(f"📁 저장 위치: {output_file}")
    print("\n🎉 테이블화 작업이 완료되었습니다!")

if __name__ == "__main__":
    main()

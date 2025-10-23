#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
프랑스어 테이블 재구성 - 누락된 영어 질문 추가
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

def rebuild_french_table():
    """프랑스어 테이블 재구성"""
    
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    # 영어 CSV 읽기
    print("📖 영어 CSV 읽기...")
    english_file = data_dir / 'Completed' / 'Complete_128_Questions - English.csv'
    english_data = {}
    with open(english_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            english_data[int(row['Index'])] = row
    
    # 병합된 프랑스어 파일 읽기
    print("📖 프랑스어 병합 파일 읽기...")
    merged_file = data_dir / 'script_work' / '2025_CitizenTest_128 - French_Merged.txt'
    with open(merged_file, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f.readlines()]
    
    # 프랑스어 질문과 답변 파싱
    fr_questions = {}
    fr_answers = {}
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # 프랑스어 질문 찾기
        match = re.match(r'^(\d+)\.\s+(.+)', line)
        if match and has_french(line):
            num = int(match.group(1))
            question = match.group(2)
            
            # 답변 수집
            answers = []
            i += 1
            while i < len(lines):
                if lines[i].startswith('●') and has_french(lines[i]):
                    answer = lines[i].lstrip('●').strip()
                    answers.append(answer)
                    i += 1
                else:
                    break
            
            if 1 <= num <= 128:
                fr_questions[num] = question
                fr_answers[num] = ', '.join(answers)
            continue
        
        i += 1
    
    print(f"✅ 파싱 완료: 프랑스어 질문 {len(fr_questions)}개")
    
    # 128개 문제 테이블 생성
    print("\n📝 128개 문제 테이블 생성 중...")
    rows = []
    
    for index in range(1, 129):
        category_en, category_fr = get_category_by_index(index)
        
        # 영어 데이터 (항상 있음)
        en_data = english_data.get(index, {})
        question_en = en_data.get('Questions', '')
        answers_en = en_data.get('Answers', '')
        
        # 프랑스어 데이터 (있으면 사용, 없으면 빈 문자열)
        question_fr = fr_questions.get(index, '')
        answers_fr = fr_answers.get(index, '')
        
        row = {
            'Index': index,
            'Category_EN': category_en,
            'SubCategory_EN': '',
            'Category_FR': category_fr,
            'SubCategory_FR': '',
            'Question_EN': question_en,
            'Answers_EN': answers_en,
            'Question_FR': question_fr,
            'Answers_FR': answers_fr
        }
        
        rows.append(row)
    
    # 저장
    output_file = data_dir / 'script_work' / '2025_CitizenTest_128 - French_Table_Fixed.csv'
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['Index', 'Category_EN', 'SubCategory_EN', 'Category_FR', 'SubCategory_FR',
                      'Question_EN', 'Answers_EN', 'Question_FR', 'Answers_FR']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"✅ 저장 완료: {output_file.name}")
    
    # 검증
    empty_q_en = [r['Index'] for r in rows if not r['Question_EN'].strip()]
    empty_a_en = [r['Index'] for r in rows if not r['Answers_EN'].strip()]
    empty_q_fr = [r['Index'] for r in rows if not r['Question_FR'].strip()]
    empty_a_fr = [r['Index'] for r in rows if not r['Answers_FR'].strip()]
    
    print("\n" + "=" * 60)
    print("🔍 최종 검증")
    print("=" * 60)
    print(f"총 문제 수: {len(rows)}개")
    print(f"\n영어:")
    print(f"  • 빈 질문: {len(empty_q_en)}개")
    print(f"  • 빈 답변: {len(empty_a_en)}개")
    print(f"\n프랑스어:")
    print(f"  • 빈 질문: {len(empty_q_fr)}개 {empty_q_fr if len(empty_q_fr) <= 30 else f'{empty_q_fr[:30]}...'}")
    print(f"  • 빈 답변: {len(empty_a_fr)}개")
    
    if not empty_q_en and not empty_a_en:
        print(f"\n✅✅✅ 모든 128개 문제에 영어 질문과 답변이 있습니다! ✅✅✅")
    
    complete_count = sum(1 for r in rows if r['Question_EN'].strip() and r['Answers_EN'].strip() 
                         and r['Question_FR'].strip() and r['Answers_FR'].strip())
    print(f"\n📊 완전한 문제 (영어+프랑스어): {complete_count}/128개")
    
    return rows

def main():
    print("=" * 60)
    print("🎯 프랑스어 테이블 재구성")
    print("=" * 60)
    print()
    
    rows = rebuild_french_table()
    
    print("\n" + "=" * 60)
    print("🎉 재구성 완료!")
    print("=" * 60)

if __name__ == "__main__":
    main()

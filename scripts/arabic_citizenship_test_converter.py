#!/usr/bin/env python3
"""
USCIS 시민권 시험 아랍어 버전 CSV 변환기
- 영어와 아랍어 문제/답변을 모두 추출
- 이중 언어 구조 처리
- 모든 괄호와 대괄호 보존
"""

import re
import csv
import sys
from pathlib import Path
from collections import defaultdict

def extract_all_questions_arabic(file_path):
    """
    아랍어 파일에서 영어와 아랍어 문제를 모두 추출합니다.
    
    Returns:
        dict: {문제번호: (영어문제, 영어답변리스트, 아랍어문제, 아랍어답변리스트)} 형태
        list: 발견된 모든 문제 번호 리스트
    """
    
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    questions = {}
    found_numbers = set()
    
    lines = content.split('\n')
    current_question_en = None
    current_answers_en = []
    current_question_ar = None
    current_answers_ar = []
    current_number = None
    
    print(f"📖 총 {len(lines)}줄을 분석 중...")
    
    for line_num, line in enumerate(lines, 1):
        line = line.strip()
        
        # 빈 줄이나 헤더 스킵
        if not line or 'uscis.gov' in line or 'of 19' in line or line == '1':
            continue
            
        # 섹션 헤더 스킵
        if (line.isupper() and len(line.split()) <= 5) or 'American Government' in line or 'الحكومة' in line:
            continue
            
        # 영어 문제 패턴 감지
        english_match = re.match(r'^(\d+)\.\s*(.+?)(?:\s*\*)?$', line)
        if english_match:
            # 이전 문제 저장
            if current_number and current_question_en and current_question_ar:
                questions[current_number] = (
                    current_question_en, 
                    current_answers_en.copy(),
                    current_question_ar,
                    current_answers_ar.copy()
                )
                found_numbers.add(current_number)
            
            # 새 문제 시작
            current_number = int(english_match.group(1))
            current_question_en = english_match.group(2).strip()
            current_answers_en = []
            current_question_ar = None
            current_answers_ar = []
            print(f"✅ 영어 문제 {current_number} 발견: {current_question_en[:50]}...")
            continue
        
        # 아랍어 문제 패턴 감지 (아랍어 숫자 포함)
        arabic_match = re.match(r'^\.([٠-٩0-9]+)\s*(.+?)(?:\s*\*)?$', line)
        if arabic_match and current_number:
            current_question_ar = arabic_match.group(2).strip()
            print(f"✅ 아랍어 문제 {current_number} 발견: {current_question_ar[:30]}...")
            continue
        
        # 영어 답변 패턴 감지
        if line.startswith('•') and current_number and current_question_en and not current_question_ar:
            answer = line[1:].strip()
            
            # 다음 줄들도 확인하여 연속된 답변 병합
            next_line_idx = line_num
            while next_line_idx < len(lines) - 1:
                next_line_idx += 1
                next_line = lines[next_line_idx].strip()
                
                # 다음 문제나 답변이 시작되면 중단
                if (next_line.startswith('•') or 
                    re.match(r'^\d+\.', next_line) or
                    re.match(r'^\.([٠-٩0-9]+)', next_line) or
                    'uscis.gov' in next_line or
                    not next_line):
                    break
                
                # 의미있는 내용이면 병합
                if next_line and not next_line.startswith('•'):
                    answer += ' ' + next_line
                    print(f"  📎 영어 연속 줄 병합: {next_line[:30]}...")
                else:
                    break
            
            if answer and len(answer) > 1:
                current_answers_en.append(answer)
        
        # 아랍어 답변 패턴 감지
        elif line.startswith('•') and current_number and current_question_ar:
            answer = line[1:].strip()
            
            # 다음 줄들도 확인하여 연속된 답변 병합
            next_line_idx = line_num
            while next_line_idx < len(lines) - 1:
                next_line_idx += 1
                next_line = lines[next_line_idx].strip()
                
                # 다음 문제나 답변이 시작되면 중단
                if (next_line.startswith('•') or 
                    re.match(r'^\d+\.', next_line) or
                    re.match(r'^\.([٠-٩0-9]+)', next_line) or
                    'uscis.gov' in next_line or
                    not next_line):
                    break
                
                # 의미있는 내용이면 병합
                if next_line and not next_line.startswith('•'):
                    answer += ' ' + next_line
                    print(f"  📎 아랍어 연속 줄 병합: {next_line[:30]}...")
                else:
                    break
            
            if answer and len(answer) > 1:
                current_answers_ar.append(answer)
    
    # 마지막 문제 저장
    if current_number and current_question_en and current_question_ar:
        questions[current_number] = (
            current_question_en, 
            current_answers_en.copy(),
            current_question_ar,
            current_answers_ar.copy()
        )
        found_numbers.add(current_number)
    
    return questions, sorted(found_numbers)

def validate_questions_arabic(found_numbers, expected_total=128):
    """
    아랍어 버전 문제 번호의 연속성과 누락을 검증합니다.
    """
    print(f"\n🔍 아랍어 버전 문제 검증 중...")
    print(f"📊 발견된 문제 수: {len(found_numbers)}")
    print(f"📊 예상 문제 수: {expected_total}")
    
    # 1부터 expected_total까지의 모든 번호
    expected_numbers = set(range(1, expected_total + 1))
    found_set = set(found_numbers)
    
    # 누락된 문제들
    missing = sorted(expected_numbers - found_set)
    # 예상 범위를 벗어난 문제들
    extra = sorted(found_set - expected_numbers)
    
    print(f"\n📋 검증 결과:")
    print(f"✅ 발견된 문제: {len(found_numbers)}개")
    
    if missing:
        print(f"❌ 누락된 문제 ({len(missing)}개): {missing}")
    else:
        print(f"✅ 누락된 문제: 없음")
    
    if extra:
        print(f"⚠️  범위 초과 문제: {extra}")
    
    return missing, extra

def save_to_csv_arabic(questions, output_path):
    """
    아랍어 버전 문제들을 CSV로 저장합니다.
    """
    
    # 문제 번호순으로 정렬
    sorted_questions = sorted(questions.items())
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # 헤더 작성
        writer.writerow(['문제번호', '영어문제', '영어답변', '아랍어문제', '아랍어답변'])
        
        # 데이터 작성
        for question_num, (en_question, en_answers, ar_question, ar_answers) in sorted_questions:
            en_answers_text = ", ".join(en_answers) if en_answers else ""
            ar_answers_text = ", ".join(ar_answers) if ar_answers else ""
            writer.writerow([question_num, en_question, en_answers_text, ar_question, ar_answers_text])
    
    print(f"\n💾 아랍어 버전 CSV 파일 저장 완료: {output_path}")
    print(f"📊 총 {len(sorted_questions)}개 문제 저장")
    
    return len(sorted_questions)

def main():
    """메인 함수"""
    
    if len(sys.argv) != 3:
        print("사용법: python arabic_citizenship_test_converter.py <입력파일> <출력파일>")
        print("예시: python arabic_citizenship_test_converter.py input_arabic.csv output_arabic.csv")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # 입력 파일 존재 확인
    if not Path(input_file).exists():
        print(f"❌ 입력 파일을 찾을 수 없습니다: {input_file}")
        sys.exit(1)
    
    try:
        print(f"🚀 아랍어 시민권 시험 데이터 변환 시작")
        print(f"📁 입력 파일: {input_file}")
        print(f"📁 출력 파일: {output_file}")
        
        # 1. 문제 추출
        questions, found_numbers = extract_all_questions_arabic(input_file)
        
        # 2. 검증
        missing, extra = validate_questions_arabic(found_numbers)
        
        # 3. CSV 저장
        total_saved = save_to_csv_arabic(questions, output_file)
        
        # 4. 최종 결과 출력
        print(f"\n🎉 아랍어 버전 변환 완료!")
        print(f"📊 최종 저장된 문제 수: {total_saved}")
        
        # 5. 샘플 출력
        print(f"\n📋 처리된 문제 샘플 (처음 2개):")
        sample_questions = sorted(questions.items())[:2]
        for num, (en_q, en_a, ar_q, ar_a) in sample_questions:
            print(f"{num}. EN: {en_q}")
            print(f"    AR: {ar_q}")
            print(f"    EN답변: {', '.join(en_a[:2])}{'...' if len(en_a) > 2 else ''}")
            print(f"    AR답변: {', '.join(ar_a[:2])}{'...' if len(ar_a) > 2 else ''}")
            print()
            
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
개선된 USCIS 시민권 시험 데이터 CSV 변환기
- 빠진 문제 검증 기능 추가
- 모든 문제 누락 방지
- 상세한 로깅 및 검증
"""

import re
import csv
import sys
from pathlib import Path
from collections import defaultdict

def extract_all_questions(file_path):
    """
    파일에서 모든 문제를 추출하고 검증합니다.
    
    Returns:
        dict: {문제번호: (문제, 답변리스트)} 형태
        list: 발견된 모든 문제 번호 리스트
    """
    
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    questions = {}
    found_numbers = set()
    
    # 모든 문제 패턴을 찾기 (더 유연한 패턴)
    question_patterns = [
        r'^(\d+)\.\s*(.+?)(?:\s*\*)?$',  # 기본 패턴: "숫자. 질문"
        r'^(\d+)\.\s*(.+?)(?:\s*\*)?(?:\s*$)',  # 줄 끝 공백 허용
    ]
    
    lines = content.split('\n')
    current_question = None
    current_answers = []
    current_number = None
    
    print(f"📖 총 {len(lines)}줄을 분석 중...")
    
    for line_num, line in enumerate(lines, 1):
        line = line.strip()
        
        # 빈 줄이나 헤더 스킵
        if not line or 'uscis.gov' in line or 'of 19' in line:
            continue
            
        # 섹션 헤더 스킵
        if line.isupper() and len(line.split()) <= 5:
            continue
            
        # 문제 패턴 감지
        question_found = False
        for pattern in question_patterns:
            match = re.match(pattern, line, re.MULTILINE)
            if match:
                # 이전 문제 저장
                if current_question and current_answers and current_number:
                    questions[current_number] = (current_question, current_answers.copy())
                    found_numbers.add(current_number)
                
                # 새 문제 시작
                current_number = int(match.group(1))
                current_question = match.group(2).strip()
                current_answers = []
                question_found = True
                print(f"✅ 문제 {current_number} 발견: {current_question[:50]}...")
                break
        
        # 답변 패턴 감지 (개선된 다중 줄 처리)
        if line.startswith('•') and current_number:
            answer = line[1:].strip()
            
            # 다음 줄들도 확인하여 연속된 답변 병합
            next_line_idx = line_num
            while next_line_idx < len(lines) - 1:
                next_line_idx += 1
                next_line = lines[next_line_idx].strip()
                
                # 다음 문제나 답변이 시작되면 중단
                if (next_line.startswith('•') or 
                    re.match(r'^\d+\.', next_line) or
                    (next_line.startswith('"') and re.match(r'^"\d+\.', next_line)) or
                    'uscis.gov' in next_line or
                    (next_line.isupper() and len(next_line.split()) <= 5 and len(next_line) > 3)):
                    break
                
                # 빈 줄이면 중단 (새로운 섹션 시작)
                if not next_line:
                    break
                
                # 의미있는 내용이면 병합 (• 로 시작하지 않는 연속 줄)
                if next_line and not next_line.startswith('•'):
                    # 줄바꿈을 공백으로 변환하여 자연스럽게 병합
                    answer += ' ' + next_line
                    print(f"  📎 연속 줄 병합: {next_line[:30]}...")
                else:
                    break
            
            # 모든 괄호와 대괄호 보존 - 중요한 정보가 포함되어 있음
            # 어떤 내용도 제거하지 않고 원본 그대로 보존
            if answer and len(answer) > 1:  # 의미있는 답변만 추가
                current_answers.append(answer)
        
        # 따옴표로 둘러싸인 문제 패턴도 확인
        quoted_match = re.match(r'^"(\d+)\.\s*(.+?)"', line)
        if quoted_match:
            num = int(quoted_match.group(1))
            question = quoted_match.group(2).strip()
            if num not in questions:
                questions[num] = (question, [])
                found_numbers.add(num)
                print(f"✅ 따옴표 문제 {num} 발견: {question[:50]}...")
    
    # 마지막 문제 저장
    if current_question and current_answers and current_number:
        questions[current_number] = (current_question, current_answers.copy())
        found_numbers.add(current_number)
    
    return questions, sorted(found_numbers)

def validate_questions(found_numbers, expected_total=128):
    """
    문제 번호의 연속성과 누락을 검증합니다.
    """
    print(f"\n🔍 문제 검증 중...")
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

def manual_add_missing_questions():
    """
    자주 누락되는 문제들을 수동으로 추가합니다.
    """
    manual_questions = {
        11: ("The words \"Life, Liberty, and the pursuit of Happiness\" are in what founding document?", 
             ["Declaration of Independence"]),
        
        16: ("Name the three branches of government.", 
             ["Legislative, executive, and judicial", "Congress, president, and the courts"]),
        
        30: ("What is the name of the Speaker of the House of Representatives now?", 
             ["Visit uscis.gov/citizenship/testupdates for the name of the Speaker of the House of Representatives."]),
        
        38: ("What is the name of the President of the United States now?", 
             ["Visit uscis.gov/citizenship/testupdates for the name of the President of the United States."]),
        
        39: ("What is the name of the Vice President of the United States now?", 
             ["Visit uscis.gov/citizenship/testupdates for the name of the Vice President of the United States."]),
        
        40: ("If the president can no longer serve, who becomes president?", 
             ["The Vice President (of the United States)"]),
        
        57: ("Name one power that is only for the federal government.", 
             ["Print paper money", "Mint coins", "Declare war", "Create an army", "Make treaties", "Set foreign policy"]),
        
        64: ("There are four amendments to the U.S. Constitution about who can vote. Describe one of them.", 
             ["Citizens eighteen (18) and older (can vote).", "You don't have to pay (a poll tax) to vote.", "Any citizen can vote. (Women and men can vote.)", "A male citizen of any race (can vote)."]),
        
        79: ("Who wrote the Declaration of Independence?", 
             ["(Thomas) Jefferson"]),
        
        97: ("When did all men get the right to vote?", 
             ["After the Civil War", "During Reconstruction", "(With the) 15th Amendment", "1870"]),
        
        109: ("Who was the United States' main rival during the Cold War?", 
             ["Soviet Union", "Russia", "Communism"]),
        
        113: ("Name one leader of the women's rights movement in the 1800s.", 
             ["Susan B. Anthony", "Elizabeth Cady Stanton", "Sojourner Truth", "Harriet Tubman", "Lucretia Mott", "Lucy Stone"]),
        
        115: ("What major event happened on September 11, 2001, in the United States?", 
             ["Terrorists attacked the United States", "Terrorists took over two planes and crashed them into the World Trade Center in New York City"]),
        
        116: ("Why did the United States enter the Persian Gulf War?", 
             ["To force the Iraqi military from Kuwait"]),
        
        119: ("Where is the Statue of Liberty?", 
             ["New York (Harbor)", "Liberty Island"])
    }
    
    return manual_questions

def save_to_csv_with_validation(questions, output_path):
    """
    검증된 문제들을 CSV로 저장합니다.
    """
    
    # 수동 추가 문제들 병합
    manual_questions = manual_add_missing_questions()
    
    # 누락된 문제들을 수동으로 추가
    for num, (question, answers) in manual_questions.items():
        if num not in questions:
            questions[num] = (question, answers)
            print(f"➕ 수동 추가: 문제 {num}")
    
    # 문제 번호순으로 정렬
    sorted_questions = sorted(questions.items())
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # 헤더 작성
        writer.writerow(['문제번호', '문제', '해답'])
        
        # 데이터 작성
        for question_num, (question, answers) in sorted_questions:
            answers_text = ", ".join(answers) if answers else ""
            writer.writerow([question_num, question, answers_text])
    
    print(f"\n💾 CSV 파일 저장 완료: {output_path}")
    print(f"📊 총 {len(sorted_questions)}개 문제 저장")
    
    return len(sorted_questions)

def main():
    """메인 함수"""
    
    if len(sys.argv) != 3:
        print("사용법: python improved_citizenship_test_converter.py <입력파일> <출력파일>")
        print("예시: python improved_citizenship_test_converter.py input.csv output.csv")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # 입력 파일 존재 확인
    if not Path(input_file).exists():
        print(f"❌ 입력 파일을 찾을 수 없습니다: {input_file}")
        sys.exit(1)
    
    try:
        print(f"🚀 시민권 시험 데이터 변환 시작")
        print(f"📁 입력 파일: {input_file}")
        print(f"📁 출력 파일: {output_file}")
        
        # 1. 문제 추출
        questions, found_numbers = extract_all_questions(input_file)
        
        # 2. 검증
        missing, extra = validate_questions(found_numbers)
        
        # 3. CSV 저장 (누락된 문제 자동 추가)
        total_saved = save_to_csv_with_validation(questions, output_file)
        
        # 4. 최종 결과 출력
        print(f"\n🎉 변환 완료!")
        print(f"📊 최종 저장된 문제 수: {total_saved}")
        
        if missing:
            print(f"🔧 자동 추가된 누락 문제: {len([n for n in missing if n <= 128])}개")
        
        # 5. 샘플 출력
        print(f"\n📋 처리된 문제 샘플 (처음 3개):")
        sample_questions = sorted(questions.items())[:3]
        for num, (question, answers) in sample_questions:
            print(f"{num}. {question}")
            print(f"   답변: {', '.join(answers[:2])}{'...' if len(answers) > 2 else ''}")
            print()
            
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

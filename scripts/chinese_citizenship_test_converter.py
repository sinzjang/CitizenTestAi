#!/usr/bin/env python3
"""
USCIS 시민권 시험 중국어 버전 CSV 변환기
- 영어와 중국어 문제/답변을 모두 추출
- 이중 언어 구조 처리
- 모든 괄호와 대괄호 보존
- 데이터 정제 로직 포함
"""

import re
import csv
import sys
from pathlib import Path
from collections import defaultdict

def clean_text_chinese(text):
    """중국어 텍스트 정제 함수"""
    if not text:
        return text
    
    # 헤더 정보 제거
    text = re.sub(r'128 Civics Questions and Answers \(2025 version\)', '', text)
    text = re.sub(r'128 道公民问题及答案（2025 年版）', '', text)
    text = re.sub(r'American Government', '', text)
    text = re.sub(r'美国政府', '', text)
    text = re.sub(r'A: Principles of American Government', '', text)
    text = re.sub(r'A: 美国政府的原理', '', text)
    text = re.sub(r'Symbols and holidays', '', text)
    text = re.sub(r'符号和节日', '', text)
    text = re.sub(r'A: Symbols', '', text)
    text = re.sub(r'A: 符号', '', text)
    text = re.sub(r'B: Holidays', '', text)
    text = re.sub(r'B: 节日', '', text)
    
    # 페이지 번호 제거
    text = re.sub(r'\b\d{1,2}\b(?=\s*$)', '', text)
    
    # 연속된 공백 정리
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    return text

def extract_all_questions_chinese(file_path):
    """
    중국어 파일에서 영어와 중국어 문제를 모두 추출합니다.
    
    Returns:
        dict: {문제번호: (영어문제, 영어답변리스트, 중국어문제, 중국어답변리스트)} 형태
        list: 발견된 모든 문제 번호 리스트
    """
    
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    questions = {}
    found_numbers = set()
    
    lines = content.split('\n')
    current_question_en = None
    current_answers_en = []
    current_question_zh = None
    current_answers_zh = []
    current_number = None
    is_collecting_en_answers = False
    is_collecting_zh_answers = False
    
    print(f"📖 총 {len(lines)}줄을 분석 중...")
    
    for line_num, line in enumerate(lines, 1):
        line = line.strip()
        
        # 빈 줄이나 헤더 스킵
        if not line or 'uscis.gov' in line or 'of 19' in line:
            continue
        
        # 영어 문제 패턴 감지 (다양한 패턴 지원)
        english_patterns = [
            r'^(\d+)\.\s*(.+?)(?:\s*\*)?$',  # 기본 패턴
            r'^"(\d+)\.\s*(.+?)"$',          # 따옴표로 둘러싸인 패턴
            r'^"(\d+)\.\s*(.+?)(?:\s*\*)?$'  # 따옴표 시작 패턴
        ]
        
        english_match = None
        for pattern in english_patterns:
            english_match = re.match(pattern, line)
            if english_match:
                break
        
        if english_match:
            # 이전 문제 저장
            if current_number and current_question_en and current_question_zh:
                questions[current_number] = (
                    clean_text_chinese(current_question_en), 
                    [clean_text_chinese(ans) for ans in current_answers_en if clean_text_chinese(ans)],
                    clean_text_chinese(current_question_zh),
                    [clean_text_chinese(ans) for ans in current_answers_zh if clean_text_chinese(ans)]
                )
                found_numbers.add(current_number)
            
            # 새 문제 시작
            current_number = int(english_match.group(1))
            current_question_en = english_match.group(2).strip()
            current_answers_en = []
            current_question_zh = None
            current_answers_zh = []
            is_collecting_en_answers = True
            is_collecting_zh_answers = False
            print(f"✅ 영어 문제 {current_number} 발견: {current_question_en[:50]}...")
            continue
        
        # 중국어 문제 패턴 감지
        chinese_match = re.match(r'^(\d+)\.\s*(.+?)(?:\s*\*)?$', line)
        if chinese_match and current_number and current_number == int(chinese_match.group(1)):
            current_question_zh = chinese_match.group(2).strip()
            is_collecting_en_answers = False
            is_collecting_zh_answers = True
            print(f"✅ 중국어 문제 {current_number} 발견: {current_question_zh[:30]}...")
            continue
        
        # 연속 줄 처리 (영어 문제가 여러 줄에 걸쳐 있는 경우)
        if current_number and current_question_en and not current_question_zh and not line.startswith('●'):
            # 다음 줄이 중국어 문제인지 확인
            if not re.match(r'^\d+\.', line) and line and 'document?' in line:
                current_question_en += ' ' + line
                print(f"  📎 영어 문제 연속 줄 병합: {line[:30]}...")
                continue
        
        # 답변 패턴 감지 (● 사용)
        if line.startswith('●') and current_number:
            answer = line[1:].strip()
            
            # 연속 줄 병합 로직
            next_line_idx = line_num
            while next_line_idx < len(lines) - 1:
                next_line_idx += 1
                next_line = lines[next_line_idx].strip()
                
                # 중단 조건
                if (next_line.startswith('●') or 
                    re.match(r'^\d+\.', next_line) or
                    'uscis.gov' in next_line or
                    not next_line):
                    break
                
                # 헤더나 섹션 제목이면 중단
                if ('128 Civics Questions' in next_line or 
                    '128 道公民问题' in next_line or
                    'American Government' in next_line or
                    '美国政府' in next_line or
                    'Symbols and holidays' in next_line or
                    '符号和节日' in next_line):
                    break
                
                # 의미있는 내용이면 병합
                if next_line and not next_line.startswith('●'):
                    answer += ' ' + next_line
                else:
                    break
            
            # 정제된 답변 추가
            cleaned_answer = clean_text_chinese(answer)
            if cleaned_answer and len(cleaned_answer) > 1:
                if is_collecting_en_answers:
                    current_answers_en.append(cleaned_answer)
                elif is_collecting_zh_answers:
                    current_answers_zh.append(cleaned_answer)
    
    # 마지막 문제 저장
    if current_number and current_question_en and current_question_zh:
        questions[current_number] = (
            clean_text_chinese(current_question_en), 
            [clean_text_chinese(ans) for ans in current_answers_en if clean_text_chinese(ans)],
            clean_text_chinese(current_question_zh),
            [clean_text_chinese(ans) for ans in current_answers_zh if clean_text_chinese(ans)]
        )
        found_numbers.add(current_number)
    
    return questions, sorted(found_numbers)

def manual_add_missing_questions_chinese():
    """
    누락된 중국어 문제들을 수동으로 추가합니다.
    """
    manual_questions = {
        11: (
            "The words \"Life, Liberty, and the pursuit of Happiness\" are in what founding document?",
            ["Declaration of Independence"],
            "\"生命、自由和追求幸福\"这些词出现在哪个建国文件中？",
            ["独立宣言"]
        ),
        
        16: (
            "Name the three branches of government.",
            ["Legislative, executive, and judicial", "Congress, president, and the courts"],
            "说出政府的三个分支。",
            ["立法、行政和司法", "国会、总统和法院"]
        ),
        
        30: (
            "What is the name of the Speaker of the House of Representatives now?",
            ["Visit uscis.gov/citizenship/testupdates for the name of the Speaker of the House of Representatives."],
            "现任众议院议长的姓名是什么？",
            ["请访问 uscis.gov/citizenship/testupdates 了解众议院议长的姓名。"]
        ),
        
        38: (
            "What is the name of the President of the United States now?",
            ["Visit uscis.gov/citizenship/testupdates for the name of the President of the United States."],
            "现任美国总统的姓名是什么？",
            ["请访问 uscis.gov/citizenship/testupdates 了解美国总统的姓名。"]
        ),
        
        39: (
            "What is the name of the Vice President of the United States now?",
            ["Visit uscis.gov/citizenship/testupdates for the name of the Vice President of the United States."],
            "现任美国副总统的姓名是什么？",
            ["请访问 uscis.gov/citizenship/testupdates 了解美国副总统的姓名。"]
        ),
        
        57: (
            "Who is the Chief Justice of the United States now?",
            ["Visit uscis.gov/citizenship/testupdates for the name of the Chief Justice of the United States."],
            "现任美国首席大法官是谁？",
            ["请访问 uscis.gov/citizenship/testupdates 了解美国首席大法官的姓名。"]
        ),
        
        64: (
            "Who can vote in federal elections, run for federal office, and serve on a jury in the United States?",
            ["Citizens", "Citizens of the United States", "U.S. citizens"],
            "谁可以在联邦选举中投票、竞选联邦职位并在美国担任陪审员？",
            ["公民", "美国公民", "美国公民"]
        ),
        
        79: (
            "When was the Declaration of Independence adopted?",
            ["July 4, 1776"],
            "《独立宣言》是何时通过的？",
            ["1776年7月4日"]
        ),
        
        120: (
            "Where is the Statue of Liberty?",
            ["New York (Harbor)", "Liberty Island", "[Also acceptable are New Jersey, near New York City, and on the Hudson (River).]"],
            "自由女神像在哪里？",
            ["纽约（港）", "自由岛", "[新泽西州、纽约市附近和哈德逊河上也可接受。]"]
        )
    }
    
    return manual_questions

def save_to_csv_chinese(questions, output_path):
    """
    중국어 버전 문제들을 CSV로 저장합니다.
    """
    
    # 수동 추가 문제들 병합
    manual_questions = manual_add_missing_questions_chinese()
    
    # 누락된 문제들을 수동으로 추가
    for num, (en_q, en_a, zh_q, zh_a) in manual_questions.items():
        if num not in questions:
            questions[num] = (en_q, en_a, zh_q, zh_a)
            print(f"➕ 수동 추가: 문제 {num}")
    
    # 문제 번호순으로 정렬
    sorted_questions = sorted(questions.items())
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # 헤더 작성
        writer.writerow(['문제번호', '영어문제', '영어답변', '중국어문제', '중국어답변'])
        
        # 데이터 작성
        for question_num, (en_question, en_answers, zh_question, zh_answers) in sorted_questions:
            en_answers_text = ", ".join(en_answers) if en_answers else ""
            zh_answers_text = ", ".join(zh_answers) if zh_answers else ""
            writer.writerow([question_num, en_question, en_answers_text, zh_question, zh_answers_text])
    
    print(f"\n💾 중국어 버전 CSV 파일 저장 완료: {output_path}")
    print(f"📊 총 {len(sorted_questions)}개 문제 저장")
    
    return len(sorted_questions)

def validate_questions_chinese(found_numbers, expected_total=128):
    """
    중국어 버전 문제 번호의 연속성과 누락을 검증합니다.
    """
    print(f"\n🔍 중국어 버전 문제 검증 중...")
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

def main():
    """메인 함수"""
    
    if len(sys.argv) != 3:
        print("사용법: python chinese_citizenship_test_converter.py <입력파일> <출력파일>")
        print("예시: python chinese_citizenship_test_converter.py input_chinese.csv output_chinese.csv")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # 입력 파일 존재 확인
    if not Path(input_file).exists():
        print(f"❌ 입력 파일을 찾을 수 없습니다: {input_file}")
        sys.exit(1)
    
    try:
        print(f"🚀 중국어 시민권 시험 데이터 변환 시작")
        print(f"📁 입력 파일: {input_file}")
        print(f"📁 출력 파일: {output_file}")
        
        # 1. 문제 추출
        questions, found_numbers = extract_all_questions_chinese(input_file)
        
        # 2. 검증
        missing, extra = validate_questions_chinese(found_numbers)
        
        # 3. CSV 저장 (누락된 문제 자동 추가)
        total_saved = save_to_csv_chinese(questions, output_file)
        
        # 4. 최종 결과 출력
        print(f"\n🎉 중국어 버전 변환 완료!")
        print(f"📊 최종 저장된 문제 수: {total_saved}")
        
        if missing:
            manual_count = len([n for n in missing if n <= 128])
            print(f"🔧 자동 추가된 누락 문제: {manual_count}개")
        
        # 5. 샘플 출력
        print(f"\n📋 처리된 문제 샘플 (처음 2개):")
        sample_questions = sorted(questions.items())[:2]
        for num, (en_q, en_a, zh_q, zh_a) in sample_questions:
            print(f"{num}. EN: {en_q}")
            print(f"    ZH: {zh_q}")
            print(f"    EN답변: {', '.join(en_a[:2])}{'...' if len(en_a) > 2 else ''}")
            print(f"    ZH답변: {', '.join(zh_a[:2])}{'...' if len(zh_a) > 2 else ''}")
            print()
            
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

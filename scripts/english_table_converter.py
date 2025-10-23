#!/usr/bin/env python3
"""
USCIS 시민권 시험 영어 버전 테이블 변환기
- Line Break 처리 및 문장 연결
- Index/Category/SubCategory/Questions/Answers 구조
- 답변 리스트 형식 유지
"""

import re
import csv
import sys
from pathlib import Path

def clean_and_merge_lines(lines):
    """Line Break 처리 및 문장 연결"""
    merged_lines = []
    current_line = ""
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        # 숫자로 시작하는 새로운 문제인지 확인
        if re.match(r'^\d+\.', line):
            # 이전 라인이 있으면 저장
            if current_line:
                merged_lines.append(current_line)
            current_line = line
        # 리스트 표시(•)로 시작하는 답변인지 확인
        elif line.startswith('•'):
            if current_line:
                merged_lines.append(current_line)
            current_line = line
            
            # 이 답변이 여러 줄에 걸쳐 있는지 확인 (다음 줄들 체크)
            j = i + 1
            while j < len(lines):
                next_line = lines[j].strip()
                if not next_line:
                    j += 1
                    continue
                    
                # 다음 문제나 답변이 시작되면 중단
                if re.match(r'^\d+\.', next_line) or next_line.startswith('•') or \
                   re.match(r'^[A-Z]:', next_line) or next_line in ['AMERICAN HISTORY', 'SYMBOLS AND HOLIDAYS']:
                    break
                
                # 연결해야 할 줄인지 확인
                if (not next_line[0].isupper() and not next_line.startswith('"')) or \
                   next_line.startswith('the territory') or next_line.startswith('of their character') or \
                   next_line.startswith('and crashed') or next_line.startswith('capital.') or \
                   ']' in next_line or next_line.endswith(']') or \
                   next_line.startswith('[') or next_line.startswith('"['):
                    current_line += " " + next_line
                    lines[j] = ""  # 이미 처리된 줄 표시
                else:
                    break
                j += 1
            
            merged_lines.append(current_line)
            current_line = ""
        # 카테고리/섹션 표시인지 확인 (A:, B:, C: 등)
        elif re.match(r'^[A-Z]:', line) or line in ['AMERICAN HISTORY', 'SYMBOLS AND HOLIDAYS']:
            if current_line:
                merged_lines.append(current_line)
            merged_lines.append(line)
            current_line = ""
        # 따옴표로 시작하는 연결 문제인지 확인
        elif line.startswith('"') and re.search(r'\d+\.', line):
            if current_line:
                merged_lines.append(current_line)
            current_line = line
        # 이미 처리된 줄은 스킵
        elif line == "":
            continue
        else:
            # 위의 문장과 연결
            if current_line:
                current_line += " " + line
            else:
                current_line = line
    
    # 마지막 라인 추가
    if current_line:
        merged_lines.append(current_line)
    
    return merged_lines

def categorize_questions(lines):
    """카테고리 및 서브카테고리 분류"""
    
    # 카테고리 매핑
    categories = {
        'AMERICAN GOVERNMENT': 'American Government',
        'A: Principles of American Government': 'American Government',
        'B: System of Government': 'American Government', 
        'C: Rights and Responsibilities': 'American Government',
        'AMERICAN HISTORY': 'American History',
        'A: Colonial Period and Independence': 'American History',
        'B: 1800s': 'American History',
        'C: Recent American History and Other Important Historical Information': 'American History',
        'SYMBOLS AND HOLIDAYS': 'Symbols and Holidays',
        'A: Symbols': 'Symbols and Holidays',
        'B: Holidays': 'Symbols and Holidays'
    }
    
    # 서브카테고리 매핑
    subcategories = {
        'A: Principles of American Government': 'Principles of American Government',
        'B: System of Government': 'System of Government',
        'C: Rights and Responsibilities': 'Rights and Responsibilities',
        'A: Colonial Period and Independence': 'Colonial Period and Independence',
        'B: 1800s': '1800s',
        'C: Recent American History and Other Important Historical Information': 'Recent American History',
        'A: Symbols': 'Symbols',
        'B: Holidays': 'Holidays'
    }
    
    questions = []
    current_category = "American Government"  # 기본값
    current_subcategory = "Principles of American Government"  # 기본값
    current_question = None
    current_answers = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # 메인 카테고리 확인
        if line in categories:
            current_category = categories[line]
            if line in subcategories:
                current_subcategory = subcategories[line]
            continue
        
        # 서브카테고리 확인
        if line in subcategories:
            current_subcategory = subcategories[line]
            continue
        
        # 문제 패턴 확인
        question_match = re.match(r'^"?(\d+)\.\s*(.+)', line)
        if question_match:
            # 이전 문제 저장
            if current_question:
                questions.append({
                    'index': current_question['index'],
                    'category': current_category,
                    'subcategory': current_subcategory,
                    'question': current_question['text'],
                    'answers': current_answers
                })
            
            # 새 문제 시작
            question_num = int(question_match.group(1))
            question_text = question_match.group(2).strip().rstrip('"')
            
            current_question = {
                'index': question_num,
                'text': question_text
            }
            current_answers = []
            
        # 답변 패턴 확인
        elif line.startswith('•'):
            answer_text = line[1:].strip()
            current_answers.append(answer_text)
    
    # 마지막 문제 저장
    if current_question:
        questions.append({
            'index': current_question['index'],
            'category': current_category,
            'subcategory': current_subcategory,
            'question': current_question['text'],
            'answers': current_answers
        })
    
    return questions

def save_to_csv(questions, output_path):
    """CSV 파일로 저장"""
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # 헤더
        writer.writerow(['Index', 'Category', 'SubCategory', 'Questions', 'Answers'])
        
        # 데이터
        for q in questions:
            # 답변들을 쉼표로 구분된 하나의 문자열로 변환
            answers_text = ', '.join(q['answers'])
            
            writer.writerow([
                q['index'],
                q['category'],
                q['subcategory'],
                q['question'],
                answers_text
            ])
    
    print(f"💾 CSV 저장 완료: {output_path}")
    print(f"📊 총 {len(questions)}개 문제 저장")

def main():
    """메인 함수"""
    
    if len(sys.argv) != 3:
        print("사용법: python english_table_converter.py <입력파일> <출력파일>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not Path(input_file).exists():
        print(f"❌ 입력 파일을 찾을 수 없습니다: {input_file}")
        sys.exit(1)
    
    try:
        print(f"🚀 영어 시민권 시험 데이터 테이블 변환 시작")
        print(f"📁 입력 파일: {input_file}")
        print(f"📁 출력 파일: {output_file}")
        
        # 파일 읽기 (CSV 형식 처리)
        lines = []
        with open(input_file, 'r', encoding='utf-8') as file:
            if input_file.endswith('.csv'):
                # CSV 파일인 경우 두 번째 컬럼만 읽기
                import csv
                reader = csv.reader(file)
                for row in reader:
                    if len(row) > 1:
                        lines.append(row[1])
                    elif len(row) == 1:
                        lines.append(row[0])
            else:
                lines = file.readlines()
        
        print(f"📖 총 {len(lines)}줄 읽음")
        
        # Line Break 처리 및 문장 연결
        merged_lines = clean_and_merge_lines(lines)
        print(f"🔧 Line Break 처리 후: {len(merged_lines)}줄")
        
        # 카테고리 분류 및 문제 추출
        questions = categorize_questions(merged_lines)
        print(f"📋 추출된 문제 수: {len(questions)}")
        
        # 카테고리별 통계
        category_stats = {}
        for q in questions:
            cat = q['category']
            if cat not in category_stats:
                category_stats[cat] = 0
            category_stats[cat] += 1
        
        print(f"\n📊 카테고리별 문제 수:")
        for cat, count in category_stats.items():
            print(f"  • {cat}: {count}개")
        
        # CSV 저장
        save_to_csv(questions, output_file)
        
        # 샘플 출력
        if questions:
            print(f"\n📋 처리된 문제 샘플:")
            for i, q in enumerate(questions[:3]):
                print(f"{q['index']}. [{q['category']} > {q['subcategory']}]")
                print(f"    Q: {q['question']}")
                print(f"    A: {len(q['answers'])}개 답변")
                if i < 2:
                    print()
        
        print(f"\n🎉 테이블 변환 완료!")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

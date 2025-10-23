#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
중국어 시민권 시험 데이터 테이블 생성 스크립트
병합된 파일에서 테이블 형식으로 변환
"""

import re
import csv
import sys

def get_main_category_from_index(index):
    """문제 번호로부터 메인 카테고리 추론"""
    if 1 <= index <= 72:
        return 'American Government'
    elif 73 <= index <= 118:
        return 'American History'
    elif 119 <= index <= 128:
        return 'Symbols and Holidays'
    else:
        return 'American Government'  # 기본값

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

def is_chinese(text):
    """텍스트에 중국어가 포함되어 있는지 확인"""
    # 중국어 유니코드 범위: \u4e00-\u9fff
    return bool(re.search(r'[\u4e00-\u9fff]', text))

def extract_questions_and_answers(lines):
    """문제와 답변 추출 (영어와 중국어 분리)"""
    questions = []
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # 영어 문제 확인 (중국어가 없는 경우)
        if re.match(r'^\d+\.', line) and not is_chinese(line):
            question_match = re.match(r'^(\d+)\.', line)
            if question_match:
                question_index = int(question_match.group(1))
                question_en = line[len(question_match.group(0)):].strip()
                
                # 영어 답변들 수집
                answers_en = []
                i += 1
                while i < len(lines) and lines[i].strip().startswith('●') and not is_chinese(lines[i]):
                    answer = lines[i].strip()[1:].strip()  # ● 제거
                    answers_en.append(answer)
                    i += 1
                
                # 중국어 문제 찾기 (점이 있거나 없거나)
                question_zh = ""
                if i < len(lines):
                    chinese_line = lines[i].strip()
                    # "89." 형식
                    chinese_match = re.match(r'^(\d+)\.', chinese_line)
                    if chinese_match and int(chinese_match.group(1)) == question_index:
                        question_zh = chinese_line[len(chinese_match.group(0)):].strip()
                        i += 1
                    # "89亚历山大" 형식 (점 없음)
                    elif re.match(r'^(\d+)[\u4e00-\u9fff]', chinese_line):
                        chinese_match = re.match(r'^(\d+)', chinese_line)
                        if chinese_match and int(chinese_match.group(1)) == question_index:
                            question_zh = chinese_line[len(chinese_match.group(0)):].strip()
                            i += 1
                
                # 중국어 답변들 수집
                answers_zh = []
                while i < len(lines) and lines[i].strip().startswith('●'):
                    answer = lines[i].strip()[1:].strip()  # ● 제거
                    answers_zh.append(answer)
                    i += 1
                
                # 카테고리 추론
                main_category = get_main_category_from_index(question_index)
                subcategory = get_subcategory_from_index(question_index)
                
                # 문제 저장
                if question_en and question_zh:
                    questions.append({
                        'index': question_index,
                        'category': main_category,
                        'subcategory': subcategory,
                        'question_en': question_en,
                        'question_zh': question_zh,
                        'answers_en': answers_en,
                        'answers_zh': answers_zh
                    })
                
                continue
        
        i += 1
    
    return questions

def save_to_csv(questions, output_path):
    """CSV 파일로 저장"""
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # 헤더
        writer.writerow(['Index', 'Category', 'SubCategory', 'Question_EN', 'Answers_EN', 'Question_ZH', 'Answers_ZH'])
        
        # 데이터
        for q in questions:
            # 답변들을 쉼표로 구분된 하나의 문자열로 변환
            answers_en_text = ', '.join(q['answers_en'])
            answers_zh_text = ', '.join(q['answers_zh'])
            
            writer.writerow([
                q['index'],
                q['category'],
                q['subcategory'],
                q['question_en'],
                answers_en_text,
                q['question_zh'],
                answers_zh_text
            ])
    
    print(f"💾 CSV 저장 완료: {output_path}")
    print(f"📊 총 {len(questions)}개 문제 저장")

def main():
    if len(sys.argv) != 3:
        print("사용법: python chinese_table_maker.py <병합된파일> <출력파일>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    print("🚀 중국어 시민권 시험 데이터 테이블 생성 시작")
    print(f"📁 입력 파일: {input_file}")
    print(f"📁 출력 파일: {output_file}")
    
    # 파일 읽기
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"❌ 파일 읽기 오류: {e}")
        sys.exit(1)
    
    print(f"📖 총 {len(lines)}줄 읽음")
    
    # 문제와 답변 추출
    questions = extract_questions_and_answers(lines)
    print(f"📋 추출된 문제 수: {len(questions)}")
    
    # 카테고리별 통계
    category_stats = {}
    for q in questions:
        category = q['category']
        if category in category_stats:
            category_stats[category] += 1
        else:
            category_stats[category] = 1
    
    print("\n📊 카테고리별 문제 수:")
    for category, count in category_stats.items():
        print(f"  • {category}: {count}개")
    
    # CSV 저장
    save_to_csv(questions, output_file)
    
    # 샘플 출력
    print("\n📋 처리된 문제 샘플:")
    for i, q in enumerate(questions[:3]):
        print(f"{i+1}. [{q['category']} > {q['subcategory']}]")
        print(f"    Q_EN: {q['question_en'][:60]}...")
        print(f"    Q_ZH: {q['question_zh'][:60]}...")
        print(f"    A_EN: {len(q['answers_en'])}개 답변")
        print(f"    A_ZH: {len(q['answers_zh'])}개 답변")
        print()
    
    print("🎉 테이블 생성 완료!")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
스페인어 시민권 시험 데이터 테이블 생성 스크립트
병합된 파일에서 테이블 형식으로 변환
"""

import re
import csv
import sys

def get_main_category_from_subcategory(subcategory):
    """서브카테고리로부터 메인 카테고리 추론"""
    if subcategory in ['Principles of American Government', 'System of Government', 'Rights and Responsibilities']:
        return 'American Government'
    elif subcategory in ['Colonial Period and Independence', '1800s', 'Recent American History and Other Important Historical Information']:
        return 'American History'
    elif subcategory in ['Symbols', 'Holidays']:
        return 'Symbols and Holidays'
    else:
        return 'American Government'  # 기본값

def extract_questions_and_answers(lines):
    """문제와 답변 추출 (영어와 스페인어 분리)"""
    questions = []
    current_subcategory = ""
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # 서브카테고리 확인 (영어 버전만)
        if re.match(r'^[A-Z]:', line):
            # 스페인어 서브카테고리가 아닌 경우만
            if not any(spanish_word in line.lower() for spanish_word in 
                      ['principios', 'sistema', 'derechos', 'responsabilidades', 
                       'período', 'años', 'historia', 'símbolos', 'días', 'feriados']):
                current_subcategory = line[3:].strip()  # "A: " 제거
            i += 1
            continue
        
        # 영어 문제 확인 (스페인어 키워드가 없는 경우)
        if re.match(r'^\d+\.', line):
            # 스페인어 키워드 체크
            is_spanish = any(spanish_word in line.lower() for spanish_word in 
                           ['cuál', 'qué', 'quién', 'cómo', 'dónde', 'cuándo', 
                            'por qué', 'nombra', 'nombre', 'cuántos', 'cuántas'])
            
            if not is_spanish:
                # 영어 문제 시작
                question_match = re.match(r'^(\d+)\.', line)
                if question_match:
                    question_index = int(question_match.group(1))
                    question_en = line[len(question_match.group(0)):].strip()
                    
                    # 영어 답변들 수집
                    answers_en = []
                    i += 1
                    while i < len(lines) and lines[i].strip().startswith('●'):
                        answer = lines[i].strip()[1:].strip()  # ● 제거
                        answers_en.append(answer)
                        i += 1
                    
                    # 스페인어 문제 찾기
                    question_es = ""
                    if i < len(lines) and re.match(r'^\d+\.', lines[i].strip()):
                        spanish_line = lines[i].strip()
                        spanish_match = re.match(r'^(\d+)\.', spanish_line)
                        if spanish_match and int(spanish_match.group(1)) == question_index:
                            question_es = spanish_line[len(spanish_match.group(0)):].strip()
                            i += 1
                    
                    # 스페인어 답변들 수집
                    answers_es = []
                    while i < len(lines) and lines[i].strip().startswith('●'):
                        answer = lines[i].strip()[1:].strip()  # ● 제거
                        answers_es.append(answer)
                        i += 1
                    
                    # 메인 카테고리 추론
                    main_category = get_main_category_from_subcategory(current_subcategory)
                    
                    # 문제 저장
                    if question_en and question_es:
                        questions.append({
                            'index': question_index,
                            'category': main_category,
                            'subcategory': current_subcategory,
                            'question_en': question_en,
                            'question_es': question_es,
                            'answers_en': answers_en,
                            'answers_es': answers_es
                        })
                    
                    continue
        
        i += 1
    
    return questions

def save_to_csv(questions, output_path):
    """CSV 파일로 저장"""
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # 헤더
        writer.writerow(['Index', 'Category', 'SubCategory', 'Question_EN', 'Answers_EN', 'Question_ES', 'Answers_ES'])
        
        # 데이터
        for q in questions:
            # 답변들을 쉼표로 구분된 하나의 문자열로 변환
            answers_en_text = ', '.join(q['answers_en'])
            answers_es_text = ', '.join(q['answers_es'])
            
            writer.writerow([
                q['index'],
                q['category'],
                q['subcategory'],
                q['question_en'],
                answers_en_text,
                q['question_es'],
                answers_es_text
            ])
    
    print(f"💾 CSV 저장 완료: {output_path}")
    print(f"📊 총 {len(questions)}개 문제 저장")

def main():
    if len(sys.argv) != 3:
        print("사용법: python spanish_table_maker.py <병합된파일> <출력파일>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    print("🚀 스페인어 시민권 시험 데이터 테이블 생성 시작")
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
        print(f"    Q_ES: {q['question_es'][:60]}...")
        print(f"    A_EN: {len(q['answers_en'])}개 답변")
        print(f"    A_ES: {len(q['answers_es'])}개 답변")
        print()
    
    # 특정 문제 확인
    print("🔍 이전에 누락되었던 문제 확인:")
    for num in [68, 101, 115]:
        found = any(q['index'] == num for q in questions)
        if found:
            print(f"  ✅ {num}번 문제: 추출 성공")
        else:
            print(f"  ❌ {num}번 문제: 여전히 누락")
    
    print("\n🎉 테이블 생성 완료!")

if __name__ == "__main__":
    main()

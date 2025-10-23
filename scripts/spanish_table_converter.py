#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
스페인어 시민권 시험 데이터 테이블 변환기
영어와 스페인어가 함께 있는 CSV 파일을 테이블 형식으로 변환
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
            
        # 숫자로 시작하는 새로운 문제인지 확인 (영어/스페인어 모두)
        if re.match(r'^\d+\.', line):
            # 이전 라인이 있으면 저장
            if current_line:
                merged_lines.append(current_line)
            current_line = line
        # 리스트 표시(●)로 시작하는 답변인지 확인
        elif line.startswith('●'):
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
                if re.match(r'^\d+\.', next_line) or next_line.startswith('●') or \
                   next_line in ['American Government', 'GOBIERNO ESTADOUNIDENSE', 'AMERICAN HISTORY', 'HISTORIA ESTADOUNIDENSE', 'SYMBOLS AND HOLIDAYS', 'SÍMBOLOS Y DÍAS FESTIVOS'] or \
                   re.match(r'^[A-Z]:', next_line):
                    break
                
                # 연결해야 할 줄인지 확인
                if (not next_line[0].isupper() and not next_line.startswith('"')) or \
                   next_line.startswith('the territory') or next_line.startswith('el territorio') or \
                   next_line.startswith('of their character') or next_line.startswith('de su carácter') or \
                   next_line.startswith('and crashed') or next_line.startswith('y se estrelló') or \
                   next_line.startswith('capital.') or \
                   ']' in next_line or next_line.endswith(']') or \
                   next_line.startswith('[') or next_line.startswith('"['):
                    current_line += " " + next_line
                    lines[j] = ""  # 이미 처리된 줄 표시
                else:
                    break
                j += 1
            
            merged_lines.append(current_line)
            current_line = ""
        # 카테고리/섹션 표시인지 확인
        elif line in ['American Government', 'GOBIERNO ESTADOUNIDENSE', 'AMERICAN HISTORY', 'HISTORIA ESTADOUNIDENSE', 'SYMBOLS AND HOLIDAYS', 'SÍMBOLOS Y DÍAS FESTIVOS'] or \
             re.match(r'^[A-Z]:', line):
            if current_line:
                merged_lines.append(current_line)
            merged_lines.append(line)
            current_line = ""
        # 따옴표로 시작하는 연결 문제인지 확인
        elif line.startswith('"') and (re.search(r'\d+\.', line) or 'Constitution' in line or 'Constitución' in line):
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

def extract_questions_and_answers(lines):
    """문제와 답변 추출 (영어와 스페인어 분리)"""
    questions = []
    current_category = ""
    current_subcategory = ""
    temp_questions = {}  # 임시로 문제들을 저장 {index: {en_q, es_q, en_a, es_a}}
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # 카테고리 확인
        if line == 'American Government':
            current_category = 'American Government'
        elif line == 'AMERICAN HISTORY':
            current_category = 'American History'
        elif line == 'SYMBOLS AND HOLIDAYS':
            current_category = 'Symbols and Holidays'
        
        # 서브카테고리 확인 (영어 버전만)
        elif re.match(r'^[A-Z]:', line) and not any(spanish_word in line.lower() for spanish_word in ['principios', 'sistema', 'derechos', 'responsabilidades', 'período', 'independencia', 'historia', 'símbolos', 'días']):
            current_subcategory = line[3:].strip()  # "A: " 제거
        
        # 문제 확인
        elif re.match(r'^\d+\.', line):
            question_match = re.match(r'^(\d+)\.', line)
            if question_match:
                question_index = int(question_match.group(1))
                question_text = line[len(question_match.group(0)):].strip()
                
                # 임시 저장소에 문제 인덱스가 없으면 생성
                if question_index not in temp_questions:
                    temp_questions[question_index] = {
                        'category': current_category,
                        'subcategory': current_subcategory,
                        'question_en': '',
                        'question_es': '',
                        'answers_en': [],
                        'answers_es': []
                    }
                
                # 영어인지 스페인어인지 판단
                if any(spanish_word in question_text.lower() for spanish_word in ['cuál', 'qué', 'quién', 'cómo', 'dónde', 'cuándo', 'por qué', 'nombra', 'nombre', 'cuántos', 'cuántas']):
                    temp_questions[question_index]['question_es'] = question_text
                else:
                    temp_questions[question_index]['question_en'] = question_text
        
        # 답변 확인
        elif line.startswith('●'):
            answer_text = line[1:].strip()  # ● 제거
            
            # 가장 최근 문제 인덱스 찾기
            if temp_questions:
                latest_index = max(temp_questions.keys())
                
                # 영어인지 스페인어인지 판단
                if any(spanish_word in answer_text.lower() for spanish_word in ['república', 'constitución', 'democracia', 'gobierno', 'federal', 'pueblo', 'derechos', 'enmiendas', 'carta', 'estados', 'unidos', 'nación', 'presidente', 'congreso', 'senado', 'cámara', 'representantes', 'judicial', 'ejecutivo', 'legislativo']):
                    temp_questions[latest_index]['answers_es'].append(answer_text)
                else:
                    temp_questions[latest_index]['answers_en'].append(answer_text)
        
        i += 1
    
    # 임시 저장소에서 최종 리스트로 변환
    for index in sorted(temp_questions.keys()):
        q = temp_questions[index]
        if q['question_en'] and q['question_es']:  # 영어와 스페인어 문제가 모두 있는 경우만
            questions.append({
                'index': index,
                'category': q['category'],
                'subcategory': q['subcategory'],
                'question_en': q['question_en'],
                'question_es': q['question_es'],
                'answers_en': q['answers_en'],
                'answers_es': q['answers_es']
            })
    
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
        print("사용법: python spanish_table_converter.py <입력파일> <출력파일>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    print("🚀 스페인어 시민권 시험 데이터 테이블 변환 시작")
    print(f"📁 입력 파일: {input_file}")
    print(f"📁 출력 파일: {output_file}")
    
    # 파일 읽기
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            lines = [row[0] if row else '' for row in reader]
    except Exception as e:
        print(f"❌ 파일 읽기 오류: {e}")
        sys.exit(1)
    
    print(f"📖 총 {len(lines)}줄 읽음")
    
    # Line Break 처리
    merged_lines = clean_and_merge_lines(lines)
    print(f"🔧 Line Break 처리 후: {len(merged_lines)}줄")
    
    # 문제와 답변 추출
    questions = extract_questions_and_answers(merged_lines)
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
        print(f"    Q_EN: {q['question_en']}")
        print(f"    Q_ES: {q['question_es']}")
        print(f"    A_EN: {len(q['answers_en'])}개 답변")
        print(f"    A_ES: {len(q['answers_es'])}개 답변")
        print()
    
    print("🎉 테이블 변환 완료!")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
스페인어 시민권 시험 데이터 테이블 변환기 v2
영어와 스페인어가 순차적으로 있는 CSV 파일을 테이블 형식으로 변환

파일 구조:
1. Line Break 합치기 필요
2. 흐름: 영어문제 -> 영어답변 -> 스페인어문제 -> 스페인어답변
3. 큰 주제: "American Government", "American History", "Symbols and Holidays"
4. 각 주제 아래 A:, B:, C: 서브카테고리
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
                if (next_line and len(next_line) > 0 and not next_line[0].isupper() and not next_line.startswith('"')) or \
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
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # 큰 주제 확인 (영어 버전만 사용)
        if line in ['American Government', 'AMERICAN HISTORY', 'SYMBOLS AND HOLIDAYS']:
            current_category = line.replace('AMERICAN HISTORY', 'American History').replace('SYMBOLS AND HOLIDAYS', 'Symbols and Holidays')
            i += 1
            continue
        
        # 스페인어 주제는 스킵
        elif line in ['GOBIERNO ESTADOUNIDENSE', 'HISTORIA ESTADOUNIDENSE', 'SÍMBOLOS Y DÍAS FESTIVOS']:
            i += 1
            continue
        
        # 서브카테고리 확인 (영어 버전만)
        elif re.match(r'^[A-Z]:', line) and not any(spanish_word in line.lower() for spanish_word in ['principios', 'sistema', 'derechos', 'responsabilidades', 'período', 'independencia', 'historia', 'símbolos', 'días']):
            current_subcategory = line[3:].strip()  # "A: " 제거
            i += 1
            continue
        
        # 스페인어 서브카테고리는 스킵
        elif re.match(r'^[A-Z]:', line):
            i += 1
            continue
        
        # 영어 문제 확인
        elif re.match(r'^\d+\.', line) and not any(spanish_word in line.lower() for spanish_word in ['cuál', 'qué', 'quién', 'cómo', 'dónde', 'cuándo', 'por qué', 'nombra', 'nombre', 'cuántos', 'cuántas']):
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
                
                # 문제 저장
                if question_en and question_es:
                    questions.append({
                        'index': question_index,
                        'category': current_category,
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
        print("사용법: python spanish_table_converter_v2.py <입력파일> <출력파일>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    print("🚀 스페인어 시민권 시험 데이터 테이블 변환 시작 (v2)")
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

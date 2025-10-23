#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
스페인어 시민권 시험 데이터 Line Break 처리 스크립트
모든 라인 브레이크를 합쳐서 깔끔한 파일 생성
"""

import re
import csv
import sys

def is_new_section_start(line):
    """새로운 섹션의 시작인지 확인"""
    # 숫자로 시작하는 문제
    if re.match(r'^\d+\.', line):
        return True
    # 리스트 표시로 시작하는 답변
    if line.startswith('●'):
        return True
    # A:, B:, C: 서브카테고리
    if re.match(r'^[A-Z]:', line):
        return True
    # 큰 주제들 (대소문자 모두)
    if line in ['American Government', 'GOBIERNO ESTADOUNIDENSE', 
                'AMERICAN HISTORY', 'HISTORIA ESTADOUNIDENSE',
                'SYMBOLS AND HOLIDAYS', 'SÍMBOLOS Y DÍAS FESTIVOS',
                'Symbols and holidays', 'Símbolos y Días feriados']:
        return True
    return False

def merge_line_breaks(input_file, output_file):
    """Line Break 처리 및 병합"""
    
    print("🚀 Line Break 처리 시작")
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
    
    # Line Break 병합
    merged_lines = []
    current_line = ""
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # 빈 줄은 스킵
        if not line:
            i += 1
            continue
        
        # 새로운 섹션이 시작되면
        if is_new_section_start(line):
            # 이전에 모은 줄이 있으면 저장
            if current_line:
                merged_lines.append(current_line)
            # 새로운 줄 시작
            current_line = line
        else:
            # 이전 줄과 연결
            if current_line:
                current_line += " " + line
            else:
                current_line = line
        
        i += 1
    
    # 마지막 줄 추가
    if current_line:
        merged_lines.append(current_line)
    
    print(f"🔧 Line Break 처리 후: {len(merged_lines)}줄")
    
    # 결과 저장
    with open(output_file, 'w', encoding='utf-8') as f:
        for line in merged_lines:
            f.write(line + '\n')
    
    print(f"💾 저장 완료!")
    
    # 샘플 출력
    print("\n📋 처리된 라인 샘플 (처음 20줄):")
    for i, line in enumerate(merged_lines[:20]):
        print(f"{i+1:3d}: {line[:100]}{'...' if len(line) > 100 else ''}")
    
    # 통계
    category_count = sum(1 for line in merged_lines if line in ['American Government', 'AMERICAN HISTORY', 'SYMBOLS AND HOLIDAYS'])
    question_count = sum(1 for line in merged_lines if re.match(r'^\d+\.', line))
    answer_count = sum(1 for line in merged_lines if line.startswith('●'))
    
    print(f"\n📊 통계:")
    print(f"  • 큰 주제: {category_count}개")
    print(f"  • 문제 (영어+스페인어): {question_count}개")
    print(f"  • 답변 (영어+스페인어): {answer_count}개")

def main():
    if len(sys.argv) != 3:
        print("사용법: python spanish_line_merger.py <입력파일> <출력파일>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    merge_line_breaks(input_file, output_file)
    print("\n🎉 Line Break 처리 완료!")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
USCIS 시민권 시험 데이터를 CSV로 변환하는 스크립트
2025년 128개 문제 버전 지원
"""

import re
import csv
import sys
from pathlib import Path

def parse_citizenship_test_file(file_path):
    """
    시민권 시험 파일을 파싱하여 문제와 답변을 추출합니다.
    
    Args:
        file_path (str): 입력 파일 경로
        
    Returns:
        list: [(문제번호, 문제, 답변)] 형태의 리스트
    """
    
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    questions = []
    current_question = None
    current_answers = []
    question_number = None
    
    # 인트로 부분 스킵 (실제 문제는 보통 25줄 이후부터 시작)
    start_parsing = False
    
    for line_num, line in enumerate(lines):
        line = line.strip()
        
        # 빈 줄 스킵
        if not line:
            continue
            
        # 페이지 번호나 헤더 스킵
        if 'uscis.gov/citizenship' in line or 'of 19' in line:
            continue
            
        # 섹션 헤더 스킵 (대문자로만 구성된 줄)
        if line.isupper() and len(line.split()) <= 5:
            continue
            
        # 문제 패턴 감지: "숫자. 질문내용"
        question_match = re.match(r'^(\d+)\.\s*(.+?)(\s*\*)?$', line)
        
        if question_match:
            # 이전 문제가 있다면 저장
            if current_question is not None and current_answers:
                answers_text = ", ".join(current_answers)
                questions.append((question_number, current_question, answers_text))
            
            # 새 문제 시작
            question_number = int(question_match.group(1))
            current_question = question_match.group(2).strip()
            current_answers = []
            start_parsing = True
            
        # 답변 패턴 감지: "• 답변내용"
        elif line.startswith('•') and start_parsing:
            answer = line[1:].strip()  # • 제거
            # 괄호 안의 부가 설명이나 예시 정리
            answer = re.sub(r'\s*\[.*?\]', '', answer)  # [설명] 제거
            if answer:  # 빈 답변이 아닌 경우만 추가
                current_answers.append(answer)
    
    # 마지막 문제 저장
    if current_question is not None and current_answers:
        answers_text = ", ".join(current_answers)
        questions.append((question_number, current_question, answers_text))
    
    return questions

def save_to_csv(questions, output_path):
    """
    문제 데이터를 CSV 파일로 저장합니다.
    
    Args:
        questions (list): 문제 데이터 리스트
        output_path (str): 출력 CSV 파일 경로
    """
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # 헤더 작성
        writer.writerow(['문제번호', '문제', '해답'])
        
        # 데이터 작성
        for question_num, question, answers in questions:
            writer.writerow([question_num, question, answers])
    
    print(f"CSV 파일이 생성되었습니다: {output_path}")
    print(f"총 {len(questions)}개의 문제가 처리되었습니다.")

def main():
    """메인 함수"""
    
    if len(sys.argv) != 3:
        print("사용법: python convert_citizenship_test_to_csv.py <입력파일> <출력파일>")
        print("예시: python convert_citizenship_test_to_csv.py input.csv output.csv")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # 입력 파일 존재 확인
    if not Path(input_file).exists():
        print(f"오류: 입력 파일을 찾을 수 없습니다: {input_file}")
        sys.exit(1)
    
    try:
        # 파일 파싱
        print(f"파일 파싱 중: {input_file}")
        questions = parse_citizenship_test_file(input_file)
        
        if not questions:
            print("오류: 문제를 찾을 수 없습니다.")
            sys.exit(1)
        
        # CSV로 저장
        save_to_csv(questions, output_file)
        
        # 결과 미리보기
        print("\n처리된 문제 미리보기 (처음 3개):")
        for i, (num, question, answers) in enumerate(questions[:3]):
            print(f"{num}. {question}")
            print(f"   답변: {answers}")
            print()
            
    except Exception as e:
        print(f"오류 발생: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
한국어 CSV를 JSON으로 변환
"""

import csv
import json
from pathlib import Path

def parse_answers(answers_text):
    """답변 텍스트를 리스트로 변환"""
    if not answers_text or not answers_text.strip():
        return []
    
    # 쉼표로 구분된 답변들을 분리
    answers = [a.strip() for a in answers_text.split(',')]
    return answers

def parse_wrong_answers(wrong_text):
    """오답 텍스트를 리스트로 변환"""
    if not wrong_text or not wrong_text.strip():
        return []
    
    # 줄바꿈으로 구분된 오답들을 분리
    wrong_answers = [w.strip() for w in wrong_text.split('\n') if w.strip()]
    return wrong_answers

def csv_to_json(csv_file, json_file):
    """CSV를 JSON으로 변환"""
    
    print(f"📖 CSV 파일 읽기: {csv_file.name}")
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    print(f"✅ {len(rows)}개 문제 읽음")
    
    # JSON 데이터 생성
    json_data = []
    
    for row in rows:
        index = int(row['Index'])
        question = row['Question_KO'].strip()
        
        # 답변 파싱
        correct_answers_list = parse_answers(row['Answers_KO'])
        rationale = row['rationale'].strip() if row['rationale'] else ""
        
        # correctAnswers 생성
        correct_answers = []
        for answer in correct_answers_list:
            correct_answers.append({
                "text": answer,
                "rationale": rationale if rationale else f"{answer}는 올바른 답변입니다."
            })
        
        # wrongAnswers 파싱
        wrong_answers_list = parse_wrong_answers(row['Wrong'])
        wrong_answers = []
        for wrong in wrong_answers_list:
            wrong_answers.append({
                "text": wrong
            })
        
        # 문제 객체 생성
        question_obj = {
            "id": index,
            "question": question,
            "correctAnswers": correct_answers,
            "wrongAnswers": wrong_answers
        }
        
        json_data.append(question_obj)
    
    # JSON 저장
    print(f"\n💾 JSON 파일 저장: {json_file.name}")
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ {len(json_data)}개 문제 저장 완료")
    
    # 샘플 출력
    print(f"\n📝 샘플 문제 (1, 2, 3):")
    for item in json_data[:3]:
        print(f"\n문제 {item['id']}:")
        print(f"  질문: {item['question'][:60]}...")
        print(f"  정답 수: {len(item['correctAnswers'])}개")
        print(f"  오답 수: {len(item['wrongAnswers'])}개")
    
    return json_data

def main():
    print("=" * 60)
    print("🎯 한국어 CSV → JSON 변환")
    print("=" * 60)
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    csv_file = data_dir / 'Completed' / 'Complete_128_Questions - Korean.csv'
    json_file = data_dir / 'interview_questions_ko.json'
    
    # 변환
    json_data = csv_to_json(csv_file, json_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 변환 완료: {len(json_data)}개 문제")
    print(f"📁 저장 위치: {json_file}")
    print("\n🎉 JSON 변환 완료!")

if __name__ == "__main__":
    main()

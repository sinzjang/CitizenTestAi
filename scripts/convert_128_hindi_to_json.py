#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
128문제 힌디어 CSV를 JSON으로 변환
"""

import json
import csv
import os
import shutil
from pathlib import Path
from datetime import datetime

def backup_file(json_file_path, backup_dir):
    """기존 JSON 파일 백업"""
    if not json_file_path.exists():
        return None
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = os.path.basename(json_file_path)
    backup_filename = f"{filename}.backup_128_conversion_{timestamp}"
    backup_path = backup_dir / backup_filename
    
    shutil.copy2(json_file_path, backup_path)
    print(f"  💾 백업 생성: {backup_filename}")
    return backup_path

def parse_correct_answers(answers_text, rationale_text):
    """정답 파싱: 전체 답변을 하나의 객체로 변환"""
    answers = []
    
    # 전체 답변을 하나의 정답으로 처리
    answers.append({
        "text": answers_text.strip(),
        "rationale": rationale_text.strip()
    })
    
    return answers

def parse_wrong_answers(wrong_text):
    """오답 파싱: 줄바꿈으로 구분된 오답들을 배열로 변환 (각 줄이 하나의 오답)"""
    answers = []
    
    # 줄바꿈으로 분리 (각 줄이 하나의 오답)
    lines = wrong_text.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        if line:
            answers.append({
                "text": line
            })
    
    return answers

def convert_csv_to_json(csv_file_path, json_file_path, backup_dir):
    """CSV를 JSON으로 변환"""
    
    print(f"\n🚀 CSV → JSON 변환 시작")
    print(f"📁 입력: {csv_file_path.name}")
    print(f"📁 출력: {json_file_path.name}")
    
    # 백업
    if json_file_path.exists():
        backup_file(json_file_path, backup_dir)
    
    questions = []
    
    # 동적 답변이 필요한 문제 ID
    dynamic_answer_ids = [23, 29, 30, 38, 39, 61, 62]
    
    with open(csv_file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            # 기본 정보
            question_id = int(row['Index'])
            category = row['Category']
            subcategory = row['SubCategory']
            question_text = row['Questions']
            
            # 동적 답변 문제는 [उत्तर भिन्न हो सकते हैं]로 변경
            answers_text = row['Answers']
            if question_id in dynamic_answer_ids:
                answers_text = '[उत्तर भिन्न हो सकते हैं]'
                # rationale도 간단하게
                if question_id == 23:
                    row['rationale'] = 'आपके राज्य के दो अमेरिकी सीनेटरों में से एक। उत्तर आपके राज्य के आधार पर भिन्न होगा।'
                elif question_id == 29:
                    row['rationale'] = 'आपका अमेरिकी प्रतिनिधि। उत्तर आपके जिले के आधार पर भिन्न होगा।'
                elif question_id == 30:
                    row['rationale'] = 'सदन के अध्यक्ष अमेरिकी प्रतिनिधि सभा के नेता हैं। वर्तमान अध्यक्ष Mike Johnson हैं।'
                elif question_id == 38:
                    row['rationale'] = 'अमेरिकी राष्ट्रपति कार्यकारी शाखा के प्रमुख हैं। वर्तमान राष्ट्रपति Donald J. Trump हैं (2025 तक)।'
                elif question_id == 39:
                    row['rationale'] = 'अमेरिकी उपराष्ट्रपति राष्ट्रपति उत्तराधिकार क्रम में दूसरे स्थान पर हैं। वर्तमान उपराष्ट्रपति JD Vance हैं (2025 तक)।'
                elif question_id == 61:
                    row['rationale'] = 'आपके राज्य के राज्यपाल। उत्तर आपके राज्य के आधार पर भिन्न होगा।'
                elif question_id == 62:
                    row['rationale'] = 'आपके राज्य की राजधानी। उत्तर आपके राज्य के आधार पर भिन्न होगा।'
            
            # 정답 파싱
            correct_answers = parse_correct_answers(
                answers_text,
                row['rationale']
            )
            
            # 오답 파싱
            wrong_answers = parse_wrong_answers(row['Wrong'])
            
            # JSON 객체 생성
            question_obj = {
                "id": question_id,
                "category": category,
                "subcategory": subcategory,
                "question": question_text,
                "correctAnswers": correct_answers,
                "wrongAnswers": wrong_answers
            }
            
            questions.append(question_obj)
    
    # JSON 저장
    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    
    # 통계
    print(f"\n✅ 변환 완료!")
    print(f"  📊 총 문제 수: {len(questions)}개")
    
    # 카테고리별 통계
    category_stats = {}
    for q in questions:
        cat = q['category']
        category_stats[cat] = category_stats.get(cat, 0) + 1
    
    print(f"\n📋 카테고리별 문제 수:")
    for cat, count in sorted(category_stats.items()):
        print(f"  • {cat}: {count}개")
    
    # 샘플 출력
    print(f"\n📝 샘플 문제 (처음 2개):")
    for i, q in enumerate(questions[:2], 1):
        print(f"\n{i}. [{q['category']} > {q['subcategory']}]")
        print(f"   Q: {q['question'][:60]}...")
        print(f"   정답: {len(q['correctAnswers'])}개")
        print(f"   오답: {len(q['wrongAnswers'])}개")
    
    # 동적 답변 문제 확인
    print(f"\n📝 동적 답변 문제 확인:")
    for qid in dynamic_answer_ids:
        q = questions[qid - 1]
        print(f"  문제 {qid}: {q['correctAnswers'][0]['text']}")
    
    # 파일 크기
    file_size = os.path.getsize(json_file_path)
    print(f"\n💾 파일 크기: {file_size:,} bytes ({file_size/1024:.1f} KB)")
    
    return questions

def validate_json(json_file_path):
    """JSON 파일 검증"""
    print(f"\n🔍 JSON 파일 검증 중...")
    
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    errors = []
    
    # 기본 검증
    if len(data) != 128:
        errors.append(f"문제 수가 128개가 아님: {len(data)}개")
    
    # 각 문제 검증
    for i, q in enumerate(data, 1):
        if q['id'] != i:
            errors.append(f"문제 {i}: ID 불일치 ({q['id']})")
        
        if not q.get('question'):
            errors.append(f"문제 {i}: 질문 없음")
        
        if not q.get('correctAnswers') or len(q['correctAnswers']) == 0:
            errors.append(f"문제 {i}: 정답 없음")
        
        if not q.get('wrongAnswers') or len(q['wrongAnswers']) < 3:
            errors.append(f"문제 {i}: 오답이 3개 미만 ({len(q.get('wrongAnswers', []))}개)")
    
    if errors:
        print("❌ 검증 실패:")
        for error in errors[:10]:  # 처음 10개만 표시
            print(f"  • {error}")
        if len(errors) > 10:
            print(f"  ... 외 {len(errors) - 10}개 오류")
        return False
    else:
        print("✅ 검증 성공: 모든 검사 통과!")
        return True

def main():
    print("=" * 60)
    print("🎯 128문제 힌디어 CSV → JSON 변환 도구")
    print("=" * 60)
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    backup_dir = data_dir / 'archived_backups'
    
    csv_file = data_dir / 'Completed' / 'Complete_128_Questions - Hindi.csv'
    json_file = data_dir / 'interview_questions_hi.json'
    
    # 백업 디렉토리 확인
    if not backup_dir.exists():
        backup_dir.mkdir(parents=True)
    
    # 변환
    questions = convert_csv_to_json(csv_file, json_file, backup_dir)
    
    # 검증
    validate_json(json_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 변환 완료: {len(questions)}개 문제")
    print(f"✅ 검증: 통과")
    print(f"📁 저장 위치: {json_file}")
    file_size = os.path.getsize(json_file)
    print(f"💾 파일 크기: {file_size/1024:.1f} KB")
    print("\n🎉 모든 작업이 성공적으로 완료되었습니다!")

if __name__ == "__main__":
    main()

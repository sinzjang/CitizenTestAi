#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Filipino CSV를 JSON으로 변환
Complete_128_Questions - Filipino.csv → interview_questions_tl.json
"""

import csv
import json
from pathlib import Path

def parse_answers(answer_text):
    """답변 텍스트를 리스트로 파싱"""
    if not answer_text or answer_text.strip() == '':
        return []
    
    # 쉼표로 구분된 답변들을 분리
    answers = [a.strip() for a in answer_text.split(',') if a.strip()]
    return answers

def parse_wrong_answers(wrong_text):
    """잘못된 답변 텍스트를 리스트로 파싱 (줄바꿈으로 구분)"""
    if not wrong_text or wrong_text.strip() == '':
        return []
    
    # 줄바꿈으로 구분된 그룹들을 분리
    groups = [g.strip() for g in wrong_text.split('\n') if g.strip()]
    
    all_wrongs = []
    for group in groups:
        # 각 그룹 내의 쉼표로 구분된 답변들을 분리
        wrongs = [w.strip() for w in group.split(',') if w.strip()]
        all_wrongs.extend(wrongs)
    
    return all_wrongs

def get_dynamic_answer(question_id):
    """특정 질문 ID에 대한 동적 답변 로직"""
    dynamic_answers = {
        43: "name of your U.S. Representative",
        46: "name of one of your U.S. Senators",
        47: "name of your state",
        48: "name of the capital of your state",
        75: "name of your state governor",
        95: "name of your state capital"
    }
    return dynamic_answers.get(question_id)

def get_manual_fix(question_id):
    """특정 질문 ID에 대한 수동 수정"""
    manual_fixes = {
        100: "Unang Digmaang Pandaigdig, Ikalawang Digmaang Pandaigdig, Digmaang Koreano, Digmaang Vietnam, Digmaang (Persian) Gulf"
    }
    return manual_fixes.get(question_id)

def convert_filipino_to_json(csv_file, json_file):
    """Filipino CSV를 JSON으로 변환"""
    
    print(f"📖 CSV 파일 읽기: {csv_file.name}")
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    print(f"📊 총 문제 수: {len(rows)}개")
    
    questions = []
    
    for row in rows:
        question_id = int(row['Index'])
        category = row['Category']
        subcategory = row['SubCategory']
        question_text = row['Questions']
        answers_text = row['Answers']
        rationale = row['rationale']
        wrong_text = row['Wrong']
        
        # 카테고리 번역
        category_map = {
            'American Government': 'Pamahalaan ng Amerika',
            'American History': 'Kasaysayan ng Amerika',
            'Symbols and Holidays': 'Mga Simbolo at Pista'
        }
        category_tl = category_map.get(category, category)
        
        # 서브카테고리 번역 (이미 Filipino CSV에 있음)
        subcategory_tl = subcategory
        
        # 정답 파싱
        correct_answers_list = parse_answers(answers_text)
        
        # 수동 수정 체크
        manual_fix = get_manual_fix(question_id)
        if manual_fix:
            correct_answers_list = parse_answers(manual_fix)
        
        # 동적 답변 체크
        dynamic_answer = get_dynamic_answer(question_id)
        
        if dynamic_answer:
            # 동적 답변이 있는 경우
            correct_answers = [
                {
                    "text": dynamic_answer,
                    "rationale": rationale if rationale else ""
                }
            ]
        else:
            # 일반 답변
            if len(correct_answers_list) == 1:
                correct_answers = [
                    {
                        "text": correct_answers_list[0],
                        "rationale": rationale if rationale else ""
                    }
                ]
            else:
                # 여러 답변이 있는 경우 쉼표로 연결
                combined_text = ', '.join(correct_answers_list)
                correct_answers = [
                    {
                        "text": combined_text,
                        "rationale": rationale if rationale else ""
                    }
                ]
        
        # 오답 파싱
        wrong_answers_list = parse_wrong_answers(wrong_text)
        wrong_answers = [{"text": w} for w in wrong_answers_list]
        
        # 질문 객체 생성
        question_obj = {
            "id": question_id,
            "category": category_tl,
            "subcategory": subcategory_tl,
            "question": question_text,
            "correctAnswers": correct_answers,
            "wrongAnswers": wrong_answers
        }
        
        questions.append(question_obj)
    
    # JSON 저장
    print(f"\n💾 JSON 파일 저장: {json_file.name}")
    
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    
    # 검증
    print(f"\n🔍 검증:")
    print(f"  • 총 문제 수: {len(questions)}개")
    
    # 카테고리별 통계
    category_stats = {}
    for q in questions:
        cat = q['category']
        category_stats[cat] = category_stats.get(cat, 0) + 1
    
    print(f"\n📋 카테고리별 문제 수:")
    for cat, count in sorted(category_stats.items()):
        print(f"  • {cat}: {count}개")
    
    # 동적 답변 문제
    dynamic_questions = [q['id'] for q in questions if get_dynamic_answer(q['id'])]
    print(f"\n🔄 동적 답변 문제: {len(dynamic_questions)}개")
    print(f"  • ID: {dynamic_questions}")
    
    # 샘플
    print(f"\n📝 샘플 (문제 1, 2, 3):")
    for q in questions[:3]:
        print(f"\n문제 {q['id']}:")
        print(f"  질문: {q['question'][:50]}...")
        print(f"  정답: {q['correctAnswers'][0]['text'][:50]}...")
        print(f"  오답: {len(q['wrongAnswers'])}개")
    
    return questions

def main():
    print("=" * 60)
    print("🎯 Filipino CSV → JSON 변환")
    print("=" * 60)
    print()
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    csv_file = data_dir / 'Completed' / 'Complete_128_Questions - Filipino.csv'
    json_file = data_dir / 'interview_questions_tl.json'
    
    # 백업
    if json_file.exists():
        backup_file = json_file.with_suffix('.json.backup')
        print(f"📦 기존 파일 백업: {backup_file.name}")
        import shutil
        shutil.copy2(json_file, backup_file)
    
    # 변환
    questions = convert_filipino_to_json(csv_file, json_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 변환 완료: {len(questions)}개 문제")
    print(f"📁 저장 위치: {json_file}")
    print("\n🎉 Filipino JSON 업데이트 완료!")

if __name__ == "__main__":
    main()

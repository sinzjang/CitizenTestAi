#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
128문제 CSV를 JSON으로 변환
Category와 SubCategory 필드 추가
"""

import json
import csv
import os
import shutil
from pathlib import Path
from datetime import datetime

def backup_file(json_file_path, backup_dir):
    """파일 백업"""
    if not json_file_path.exists():
        print(f"  ℹ️  기존 파일 없음 - 백업 생략")
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
    
    # 백업 생성
    backup_file(json_file_path, backup_dir)
    
    # CSV 읽기
    questions = []
    
    with open(csv_file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            # 기본 정보
            question_id = int(row['Index'])
            category = row['Category']
            subcategory = row['SubCategory']
            question_text = row['Questions']
            
            # 정답 파싱
            correct_answers = parse_correct_answers(
                row['Answers'],
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
    
    # 파일 크기
    file_size = os.path.getsize(json_file_path)
    print(f"\n💾 파일 크기: {file_size:,} bytes ({file_size/1024:.1f} KB)")
    
    return {
        'total_questions': len(questions),
        'categories': category_stats,
        'file_size': file_size
    }

def validate_json(json_file_path):
    """JSON 파일 검증"""
    
    print(f"\n🔍 JSON 파일 검증 중...")
    
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    issues = []
    
    # 기본 검증
    if len(data) != 128:
        issues.append(f"⚠️  문제 수가 128개가 아닙니다: {len(data)}개")
    
    # 각 문제 검증
    for i, q in enumerate(data, 1):
        # 필수 필드 확인
        required_fields = ['id', 'category', 'subcategory', 'question', 'correctAnswers', 'wrongAnswers']
        for field in required_fields:
            if field not in q:
                issues.append(f"⚠️  문제 {i}: '{field}' 필드 없음")
        
        # ID 확인
        if q.get('id') != i:
            issues.append(f"⚠️  문제 {i}: ID 불일치 (expected: {i}, got: {q.get('id')})")
        
        # 정답 확인
        if not q.get('correctAnswers') or len(q.get('correctAnswers', [])) == 0:
            issues.append(f"⚠️  문제 {i}: 정답 없음")
        else:
            for j, ans in enumerate(q['correctAnswers']):
                if 'text' not in ans:
                    issues.append(f"⚠️  문제 {i}, 정답 {j+1}: 'text' 필드 없음")
                if 'rationale' not in ans:
                    issues.append(f"⚠️  문제 {i}, 정답 {j+1}: 'rationale' 필드 없음")
        
        # 오답 확인
        if not q.get('wrongAnswers') or len(q.get('wrongAnswers', [])) < 3:
            issues.append(f"⚠️  문제 {i}: 오답이 3개 미만 ({len(q.get('wrongAnswers', []))}개)")
    
    # 결과 출력
    if issues:
        print(f"\n❌ 검증 실패: {len(issues)}개 문제 발견")
        for issue in issues[:10]:  # 처음 10개만 출력
            print(f"  {issue}")
        if len(issues) > 10:
            print(f"  ... 외 {len(issues) - 10}개")
        return False
    else:
        print(f"✅ 검증 성공: 모든 검사 통과!")
        return True

def main():
    print("="*60)
    print("🎯 128문제 CSV → JSON 변환 도구")
    print("="*60)
    
    # 경로 설정
    base_dir = Path(__file__).parent.parent
    csv_file = base_dir / 'data' / 'Completed' / 'Complete_128_Questions - English.csv'
    json_file = base_dir / 'data' / 'interview_questions_en.json'
    backup_dir = base_dir / 'data' / 'archived_backups'
    
    # 백업 디렉토리 확인
    if not backup_dir.exists():
        backup_dir.mkdir(parents=True)
    
    # CSV 파일 확인
    if not csv_file.exists():
        print(f"❌ CSV 파일을 찾을 수 없습니다: {csv_file}")
        return
    
    # 변환 실행
    try:
        result = convert_csv_to_json(csv_file, json_file, backup_dir)
        
        # 검증
        is_valid = validate_json(json_file)
        
        # 최종 결과
        print("\n" + "="*60)
        print("📊 최종 결과")
        print("="*60)
        print(f"✅ 변환 완료: {result['total_questions']}개 문제")
        print(f"✅ 검증: {'통과' if is_valid else '실패'}")
        print(f"📁 저장 위치: {json_file}")
        print(f"💾 파일 크기: {result['file_size']/1024:.1f} KB")
        
        if is_valid:
            print("\n🎉 모든 작업이 성공적으로 완료되었습니다!")
        else:
            print("\n⚠️  검증 오류가 있습니다. 파일을 확인해주세요.")
        
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

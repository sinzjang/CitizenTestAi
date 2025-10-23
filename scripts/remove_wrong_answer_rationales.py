#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
모든 언어의 JSON 파일에서 wrongAnswers의 rationale 제거
앱에서 사용하지 않는 필드를 제거하여 파일 크기 최적화
"""

import json
import os
import shutil
from pathlib import Path
from datetime import datetime

def backup_file(json_file_path, backup_dir):
    """파일 백업"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = os.path.basename(json_file_path)
    backup_filename = f"{filename}.backup_{timestamp}"
    backup_path = backup_dir / backup_filename
    
    shutil.copy2(json_file_path, backup_path)
    print(f"  💾 백업 생성: {backup_filename}")
    return backup_path

def remove_wrong_answer_rationales(json_file_path, backup_dir):
    """JSON 파일에서 wrongAnswers의 rationale 제거"""
    
    print(f"\n📝 처리 중: {os.path.basename(json_file_path)}")
    
    # 백업 생성
    backup_file(json_file_path, backup_dir)
    
    # JSON 파일 읽기
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    original_size = os.path.getsize(json_file_path)
    rationale_count = 0
    
    # 각 질문의 wrongAnswers에서 rationale 제거
    for question in data:
        if 'wrongAnswers' in question:
            for wrong_answer in question['wrongAnswers']:
                if 'rationale' in wrong_answer:
                    del wrong_answer['rationale']
                    rationale_count += 1
    
    # 파일 저장
    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    new_size = os.path.getsize(json_file_path)
    size_reduction = original_size - new_size
    reduction_percent = (size_reduction / original_size * 100) if original_size > 0 else 0
    
    print(f"  ✅ 제거된 rationale: {rationale_count}개")
    print(f"  📊 원본 크기: {original_size:,} bytes")
    print(f"  📊 새 크기: {new_size:,} bytes")
    print(f"  💾 절감: {size_reduction:,} bytes ({reduction_percent:.1f}%)")
    
    return {
        'file': os.path.basename(json_file_path),
        'rationales_removed': rationale_count,
        'original_size': original_size,
        'new_size': new_size,
        'size_reduction': size_reduction,
        'reduction_percent': reduction_percent
    }

def main():
    print("🚀 wrongAnswers rationale 제거 시작\n")
    
    # data 폴더 경로
    data_dir = Path(__file__).parent.parent / 'data'
    backup_dir = data_dir / 'archived_backups'
    
    # 백업 디렉토리 확인
    if not backup_dir.exists():
        backup_dir.mkdir(parents=True)
        print(f"📁 백업 디렉토리 생성: {backup_dir}")
    
    print(f"📁 백업 위치: {backup_dir}\n")
    
    # 처리할 언어 파일들
    language_files = [
        'interview_questions_en.json',
        'interview_questions_ko.json',
        'interview_questions_es.json',
        'interview_questions_zh.json',
        'interview_questions_tl.json',
        'interview_questions_vi.json',
        'interview_questions_hi.json',
        'interview_questions_fr.json',
        'interview_questions_ar.json'
    ]
    
    results = []
    
    # 각 파일 처리
    for filename in language_files:
        file_path = data_dir / filename
        if file_path.exists():
            result = remove_wrong_answer_rationales(file_path, backup_dir)
            results.append(result)
        else:
            print(f"⚠️  파일 없음: {filename}")
    
    # 전체 통계
    print("\n" + "="*60)
    print("📊 전체 통계")
    print("="*60)
    
    total_rationales = sum(r['rationales_removed'] for r in results)
    total_original = sum(r['original_size'] for r in results)
    total_new = sum(r['new_size'] for r in results)
    total_reduction = total_original - total_new
    total_percent = (total_reduction / total_original * 100) if total_original > 0 else 0
    
    print(f"\n처리된 파일: {len(results)}개")
    print(f"제거된 rationale 총계: {total_rationales:,}개")
    print(f"원본 총 크기: {total_original:,} bytes ({total_original/1024:.1f} KB)")
    print(f"새 총 크기: {total_new:,} bytes ({total_new/1024:.1f} KB)")
    print(f"총 절감: {total_reduction:,} bytes ({total_reduction/1024:.1f} KB, {total_percent:.1f}%)")
    
    print("\n✅ 모든 파일 처리 완료!")
    
    # 파일별 상세 결과
    print("\n" + "="*60)
    print("📋 파일별 상세 결과")
    print("="*60)
    for result in results:
        print(f"\n{result['file']}:")
        print(f"  - Rationales 제거: {result['rationales_removed']}개")
        print(f"  - 크기 절감: {result['size_reduction']:,} bytes ({result['reduction_percent']:.1f}%)")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Arabic JSON의 Category와 SubCategory를 아랍어로 업데이트
"""

import csv
import json
from pathlib import Path

def get_arabic_categories_from_csv(csv_file):
    """CSV에서 카테고리 매핑 추출"""
    
    category_map = {}
    subcategory_map = {}
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            index = int(row['Index'])
            category_en = row['Category']
            subcategory_en = row['SubCategory']
            category_ar = row['Category_AR']
            subcategory_ar = row['SubCategory_AR']
            
            # 카테고리 매핑
            if category_en and category_ar:
                category_map[category_en] = category_ar
            
            # 서브카테고리 매핑 (영어 -> 아랍어)
            if subcategory_en and subcategory_ar:
                subcategory_map[subcategory_en] = subcategory_ar
    
    return category_map, subcategory_map

def get_subcategory_by_index(index):
    """문제 번호로 서브카테고리 결정 (아랍어)"""
    # American Government (1-72)
    if 1 <= index <= 14:
        return "Principles of American Government", "مبادئ الحكومة الأمریكیة"
    elif 15 <= index <= 57:
        return "System of Government", "نظام الحكومة"
    elif 58 <= index <= 72:
        return "Rights and Responsibilities", "الحقوق والمسؤوليات"
    # American History (73-118)
    elif 73 <= index <= 87:
        return "Colonial Period and Independence", "الفترة الاستعمارية والاستقلال"
    elif 88 <= index <= 99:
        return "1800s", "القرن التاسع عشر"
    elif 100 <= index <= 118:
        return "Recent American History and Other Important Historical Information", "التاريخ الأمريكي الحديث ومعلومات تاريخية مهمة أخرى"
    # Symbols and Holidays (119-128)
    elif 119 <= index <= 128:
        return "Symbols and Holidays", "الرموز والعطلات"
    
    return "", ""

def update_arabic_json_categories(csv_file, json_file):
    """JSON의 Category와 SubCategory를 아랍어로 업데이트"""
    
    print(f"📖 CSV 파일 읽기: {csv_file.name}")
    
    # CSV에서 카테고리 매핑 추출
    category_map, subcategory_map = get_arabic_categories_from_csv(csv_file)
    
    print(f"📊 카테고리 매핑: {len(category_map)}개")
    print(f"📊 서브카테고리 매핑: {len(subcategory_map)}개")
    
    # JSON 읽기
    print(f"\n📖 JSON 파일 읽기: {json_file.name}")
    
    with open(json_file, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    print(f"📊 총 문제 수: {len(questions)}개")
    
    # 백업
    backup_file = json_file.with_suffix('.json.backup')
    print(f"\n📦 기존 파일 백업: {backup_file.name}")
    import shutil
    shutil.copy2(json_file, backup_file)
    
    # Category와 SubCategory 업데이트
    updated_count = 0
    
    for q in questions:
        question_id = q['id']
        
        # 인덱스로 카테고리 결정
        if 1 <= question_id <= 72:
            category_en = "American Government"
            category_ar = "الحكومة الأمريكية"
        elif 73 <= question_id <= 118:
            category_en = "American History"
            category_ar = "التاريخ الأمريكي"
        elif 119 <= question_id <= 128:
            category_en = "Symbols and Holidays"
            category_ar = "الرموز والعطلات"
        else:
            category_en = ""
            category_ar = ""
        
        # 서브카테고리 결정
        subcategory_en, subcategory_ar = get_subcategory_by_index(question_id)
        
        # 업데이트
        q['category'] = category_ar
        q['subcategory'] = subcategory_ar
        updated_count += 1
    
    # JSON 저장
    print(f"\n💾 JSON 파일 저장: {json_file.name}")
    
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    
    # 검증
    print(f"\n🔍 검증:")
    print(f"  • 업데이트된 문제: {updated_count}개")
    
    # 카테고리별 통계
    category_stats = {}
    for q in questions:
        cat = q.get('category', '')
        category_stats[cat] = category_stats.get(cat, 0) + 1
    
    print(f"\n📋 카테고리별 문제 수:")
    for cat, count in sorted(category_stats.items()):
        print(f"  • {cat}: {count}개")
    
    # 샘플
    print(f"\n📝 샘플 (문제 1, 50, 100):")
    for qid in [1, 50, 100]:
        q = next((q for q in questions if q['id'] == qid), None)
        if q:
            print(f"\n문제 {qid}:")
            print(f"  카테고리: {q.get('category', 'N/A')}")
            print(f"  서브카테고리: {q.get('subcategory', 'N/A')}")
    
    return questions

def main():
    print("=" * 60)
    print("🎯 Arabic JSON Category 업데이트")
    print("=" * 60)
    print()
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    csv_file = data_dir / 'Completed' / '2025_CitizenTest_128 - Arabic_Table.csv'
    json_file = data_dir / 'interview_questions_ar.json'
    
    # 업데이트
    questions = update_arabic_json_categories(csv_file, json_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 업데이트 완료: {len(questions)}개 문제")
    print(f"📁 저장 위치: {json_file}")
    print("\n🎉 Arabic JSON Category 업데이트 완료!")

if __name__ == "__main__":
    main()

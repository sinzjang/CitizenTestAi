#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
프랑스어 CSV Line Breaked 컬럼 병합
Line Breaked에 텍스트가 있으면 위의 Text와 연결
"""

import csv
from pathlib import Path

def merge_line_breaks(input_file, output_file):
    """Line Breaked 컬럼의 텍스트를 Text와 병합"""
    
    print(f"📖 파일 읽기: {input_file.name}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    print(f"📊 원본 행 수: {len(rows)}개")
    
    # 병합된 행들
    merged_rows = []
    
    i = 0
    while i < len(rows):
        current_row = rows[i]
        index = current_row['Index']
        text = current_row['Text']
        line_breaked = current_row['Line Breaked'].strip()
        
        # Text가 비어있고 Line Breaked에 텍스트가 있으면
        # 이전 행의 Text와 병합
        if not text and line_breaked:
            # 이전 행이 있으면 병합
            if merged_rows:
                prev_row = merged_rows[-1]
                prev_row['Text'] = prev_row['Text'] + ' ' + line_breaked
            i += 1
            continue
        
        # Text가 있으면 추가
        if text:
            merged_rows.append({
                'Index': index,
                'Text': text
            })
        
        i += 1
    
    # 저장
    print(f"💾 파일 저장: {output_file.name}")
    print(f"📊 병합 후 행 수: {len(merged_rows)}개")
    
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['Index', 'Text'])
        writer.writeheader()
        writer.writerows(merged_rows)
    
    # 샘플 출력
    print(f"\n📝 병합 샘플 (처음 10개):")
    for i, row in enumerate(merged_rows[:10], 1):
        text = row['Text']
        if len(text) > 80:
            print(f"{row['Index']}. {text[:80]}...")
        else:
            print(f"{row['Index']}. {text}")
    
    # Line Breaked가 있었던 행 확인
    breaked_count = sum(1 for r in rows if r['Line Breaked'].strip())
    print(f"\n📊 통계:")
    print(f"  • Line Breaked가 있던 행: {breaked_count}개")
    print(f"  • 병합 완료: {len(merged_rows)}개 행")
    
    return merged_rows

def main():
    print("=" * 60)
    print("🎯 프랑스어 CSV Line Breaked 병합")
    print("=" * 60)
    print()
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data' / 'script_work'
    
    input_file = data_dir / '2025_CitizenTest_128 - French.csv'
    output_file = data_dir / '2025_CitizenTest_128 - French_Merged_New.txt'
    
    # 병합
    merged_rows = merge_line_breaks(input_file, output_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 병합 완료: {len(merged_rows)}개 행")
    print(f"📁 저장 위치: {output_file}")
    print("\n🎉 Line Breaked 병합 완료!")

if __name__ == "__main__":
    main()

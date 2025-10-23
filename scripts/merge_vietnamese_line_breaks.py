#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
베트남어 CSV 파일의 라인 브레이크 합치기
멀티라인 텍스트를 한 줄로 병합
"""

from pathlib import Path

def has_vietnamese(text):
    """텍스트에 베트남어가 포함되어 있는지 확인"""
    vietnamese_chars = 'ăâđêôơưĂÂĐÊÔƠƯáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ'
    return any(char in vietnamese_chars for char in text)

def merge_line_breaks(input_file, output_file):
    """라인 브레이크를 합쳐서 정리된 파일 생성
    
    규칙:
    - 숫자.로 시작하는 줄 (예: 1., 2., 11.) → 새 라인
    - ●로 시작하는 줄 → 새 라인
    - "로 시작하는 줄 → 새 라인
    - A:, B:, C:로 시작하는 줄 → 새 라인
    - 그 외 모두 → 이전 줄에 병합
    """
    
    print(f"📖 파일 읽기: {input_file.name}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    merged_lines = []
    current_line = ""
    
    for line in lines:
        stripped = line.rstrip('\n')
        
        # 빈 줄은 건너뛰기
        if not stripped:
            continue
        
        # 새 항목 시작 조건:
        # 1. 숫자.로 시작 (1., 2., 11., 123. 등)
        # 2. ●로 시작
        # 3. "로 시작 (따옴표)
        # 4. A:, B:, C:로 시작 (서브카테고리)
        is_new_item = False
        
        # 1. 숫자.로 시작하는지 확인
        if stripped and stripped[0].isdigit():
            import re
            if re.match(r'^\d+\.', stripped):
                is_new_item = True
        
        # 2. ●로 시작
        if stripped.startswith('●'):
            is_new_item = True
        
        # 3. "로 시작 (따옴표)
        if stripped.startswith('"'):
            is_new_item = True
        
        # 4. A:, B:, C:로 시작 (서브카테고리)
        if stripped.startswith(('A:', 'B:', 'C:')):
            is_new_item = True
        
        # 5. 베트남어로만 이루어진 줄 (카테고리 또는 서브카테고리)
        # 단, 이전 줄이 영어 서브카테고리(A:, B:, C:)인 경우
        if has_vietnamese(stripped) and not any(c.isascii() and c.isalpha() for c in stripped):
            if current_line and current_line.startswith(('A:', 'B:', 'C:')):
                is_new_item = True
        
        # 새 항목이면 이전 줄 저장하고 새로 시작
        if is_new_item:
            if current_line:
                merged_lines.append(current_line.strip())
            current_line = stripped
        else:
            # 계속 이어붙이기
            if current_line:
                current_line += " " + stripped
            else:
                current_line = stripped
    
    # 마지막 줄 처리
    if current_line.strip():
        merged_lines.append(current_line.strip())
    
    # 저장
    print(f"💾 파일 저장: {output_file.name}")
    print(f"📊 원본 라인 수: {len(lines)}")
    print(f"📊 병합 후 라인 수: {len(merged_lines)}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        for line in merged_lines:
            f.write(line + '\n')
    
    # 샘플 출력
    print(f"\n📝 병합된 라인 샘플 (처음 10개):")
    for i, line in enumerate(merged_lines[:10], 1):
        if len(line) > 80:
            print(f"{i}. {line[:80]}...")
        else:
            print(f"{i}. {line}")
    
    return merged_lines

def main():
    print("=" * 60)
    print("🎯 베트남어 CSV 라인 브레이크 합치기")
    print("=" * 60)
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data' / 'script_work'
    
    input_file = data_dir / '2025_CitizenTest_128 - Vietnamese.csv'
    output_file = data_dir / '2025_CitizenTest_128 - Vietnamese_Merged.txt'
    
    # 병합
    merged_lines = merge_line_breaks(input_file, output_file)
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 최종 결과")
    print("=" * 60)
    print(f"✅ 병합 완료: {len(merged_lines)}개 라인")
    print(f"📁 저장 위치: {output_file}")
    print("\n🎉 라인 브레이크 합치기 완료!")

if __name__ == "__main__":
    main()

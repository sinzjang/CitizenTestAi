#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
프랑스어 CSV 파일 검증 - 1부터 128까지 모든 문제가 있는지 확인
"""

import re
from pathlib import Path

def has_french(text):
    """텍스트에 프랑스어 특수문자가 포함되어 있는지 확인"""
    french_chars = 'àâäæçéèêëïîôùûüÿœÀÂÄÆÇÉÈÊËÏÎÔÙÛÜŸŒ'
    return any(char in french_chars for char in text)

def verify_questions(merged_file):
    """병합된 파일에서 1-128 문제 확인"""
    
    print(f"📖 파일 읽기: {merged_file.name}\n")
    
    with open(merged_file, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f.readlines()]
    
    # 영어와 프랑스어 질문 추적
    en_questions = {}  # {번호: 질문텍스트}
    fr_questions = {}  # {번호: 질문텍스트}
    
    for i, line in enumerate(lines):
        # 숫자.로 시작하는 줄 찾기
        match = re.match(r'^(\d+)\.\s+(.+)', line)
        if match:
            num = int(match.group(1))
            text = match.group(2)
            
            if has_french(line):
                fr_questions[num] = text
            else:
                en_questions[num] = text
    
    print("=" * 60)
    print("📊 질문 카운트")
    print("=" * 60)
    print(f"영어 질문: {len(en_questions)}개")
    print(f"프랑스어 질문: {len(fr_questions)}개")
    
    # 1-128 범위 확인
    en_in_range = {k: v for k, v in en_questions.items() if 1 <= k <= 128}
    fr_in_range = {k: v for k, v in fr_questions.items() if 1 <= k <= 128}
    
    print(f"\n1-128 범위 내:")
    print(f"  영어: {len(en_in_range)}개")
    print(f"  프랑스어: {len(fr_in_range)}개")
    
    # 누락된 문제 찾기
    print("\n" + "=" * 60)
    print("🔍 누락된 문제 확인 (1-128)")
    print("=" * 60)
    
    missing_en = [i for i in range(1, 129) if i not in en_in_range]
    missing_fr = [i for i in range(1, 129) if i not in fr_in_range]
    
    if missing_en:
        print(f"\n⚠️  누락된 영어 질문 ({len(missing_en)}개):")
        print(f"   {missing_en}")
    else:
        print(f"\n✅ 영어 질문: 1-128 모두 있음!")
    
    if missing_fr:
        print(f"\n⚠️  누락된 프랑스어 질문 ({len(missing_fr)}개):")
        print(f"   {missing_fr}")
    else:
        print(f"\n✅ 프랑스어 질문: 1-128 모두 있음!")
    
    # 중복된 문제 찾기
    print("\n" + "=" * 60)
    print("🔍 중복된 문제 확인")
    print("=" * 60)
    
    from collections import Counter
    
    all_en_nums = [k for k in en_questions.keys() if 1 <= k <= 128]
    all_fr_nums = [k for k in fr_questions.keys() if 1 <= k <= 128]
    
    en_duplicates = {k: v for k, v in Counter(all_en_nums).items() if v > 1}
    fr_duplicates = {k: v for k, v in Counter(all_fr_nums).items() if v > 1}
    
    if en_duplicates:
        print(f"\n⚠️  중복된 영어 질문:")
        for num, count in sorted(en_duplicates.items()):
            print(f"   문제 {num}: {count}번 나타남")
    else:
        print(f"\n✅ 영어 질문: 중복 없음")
    
    if fr_duplicates:
        print(f"\n⚠️  중복된 프랑스어 질문:")
        for num, count in sorted(fr_duplicates.items()):
            print(f"   문제 {num}: {count}번 나타남")
    else:
        print(f"\n✅ 프랑스어 질문: 중복 없음")
    
    # 범위 밖 문제
    out_of_range_en = {k: v for k, v in en_questions.items() if k < 1 or k > 128}
    out_of_range_fr = {k: v for k, v in fr_questions.items() if k < 1 or k > 128}
    
    if out_of_range_en or out_of_range_fr:
        print("\n" + "=" * 60)
        print("⚠️  범위 밖 문제 (1-128 범위 외)")
        print("=" * 60)
        
        if out_of_range_en:
            print(f"\n영어: {list(out_of_range_en.keys())}")
        if out_of_range_fr:
            print(f"프랑스어: {list(out_of_range_fr.keys())}")
    
    # 샘플 출력
    print("\n" + "=" * 60)
    print("📝 샘플 (문제 1, 97, 128)")
    print("=" * 60)
    
    for num in [1, 97, 128]:
        print(f"\n문제 {num}:")
        if num in en_in_range:
            print(f"  EN: {en_in_range[num][:60]}...")
        else:
            print(f"  EN: ❌ 없음")
        
        if num in fr_in_range:
            print(f"  FR: {fr_in_range[num][:60]}...")
        else:
            print(f"  FR: ❌ 없음")
    
    return en_in_range, fr_in_range, missing_en, missing_fr

def main():
    print("=" * 60)
    print("🎯 프랑스어 CSV 파일 검증")
    print("=" * 60)
    print()
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data' / 'script_work'
    
    merged_file = data_dir / '2025_CitizenTest_128 - French_Merged.txt'
    
    # 검증
    en_q, fr_q, missing_en, missing_fr = verify_questions(merged_file)
    
    # 최종 요약
    print("\n" + "=" * 60)
    print("📊 최종 요약")
    print("=" * 60)
    print(f"✅ 영어 질문 (1-128): {len(en_q)}/128개")
    print(f"✅ 프랑스어 질문 (1-128): {len(fr_q)}/128개")
    
    if not missing_en and not missing_fr:
        print(f"\n🎉 모든 128개 문제가 영어와 프랑스어로 존재합니다!")
    else:
        print(f"\n⚠️  누락된 문제가 있습니다.")
        print(f"   영어 누락: {len(missing_en)}개")
        print(f"   프랑스어 누락: {len(missing_fr)}개")

if __name__ == "__main__":
    main()

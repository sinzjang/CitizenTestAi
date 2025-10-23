#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI에게 줄 문제 데이터 추출
"""

import json
from pathlib import Path

def extract_questions_for_ai(start_q, end_q):
    """특정 범위의 문제를 AI 프롬프트용으로 추출"""
    
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / 'data'
    
    with open(data_dir / 'interview_questions_ko.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    output = []
    output.append(f"# 챕터: Q.{start_q}-Q.{end_q}\n")
    
    for q in questions:
        if start_q <= q['id'] <= end_q:
            output.append(f"**Q.{q['id']}: {q['question']}**")
            
            if q.get('correctAnswers'):
                answers = q['correctAnswers'][0]['text']
                output.append(f"정답: {answers}")
            
            output.append("")
    
    result = "\n".join(output)
    
    # 파일로 저장
    output_file = data_dir / f'ai_prompt_Q{start_q}-Q{end_q}.txt'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(result)
    
    print(result)
    print(f"\n\n💾 저장됨: {output_file}")
    
    return result

if __name__ == "__main__":
    # 챕터별로 추출
    chapters = [
        (1, 15, "헌법의 탄생"),
        (16, 62, "삼권분립"),
        (63, 72, "시민의 권리와 책임"),
        (73, 89, "식민지에서 독립까지"),
        (90, 99, "1800년대"),
        (100, 118, "근현대사"),
        (119, 128, "상징과 휴일")
    ]
    
    print("=" * 60)
    print("📝 AI 프롬프트용 문제 추출")
    print("=" * 60)
    print()
    
    for start, end, title in chapters:
        print(f"\n{'='*60}")
        print(f"📖 {title} (Q.{start}-Q.{end})")
        print(f"{'='*60}\n")
        extract_questions_for_ai(start, end)
        print("\n")

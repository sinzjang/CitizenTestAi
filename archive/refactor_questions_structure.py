#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os

def refactor_questions_structure():
    """
    기존 질문 파일들을 새로운 구조로 리팩토링합니다.
    - 기본 메타데이터 파일과 언어별 번역 파일로 분리
    """
    
    # 원본 파일 로드
    with open('data/interview_questions.json', 'r', encoding='utf-8') as f:
        original_data = json.load(f)
    
    print(f"원본 데이터 로드 완료: {len(original_data)}개 질문")
    
    # 1. 기본 메타데이터 파일 생성
    base_structure = []
    for item in original_data:
        base_item = {
            "id": item["id"]
        }
        # 카테고리나 난이도 정보가 있다면 추가 (현재는 없으므로 기본값)
        base_structure.append(base_item)
    
    # 기본 구조 파일 저장
    with open('data/interview_questions_base.json', 'w', encoding='utf-8') as f:
        json.dump(base_structure, f, ensure_ascii=False, indent=2)
    
    print("✅ 기본 메타데이터 파일 생성 완료: interview_questions_base.json")
    
    # 2. 한국어 번역 파일 생성
    korean_data = []
    for item in original_data:
        korean_item = {
            "id": item["id"],
            "question": item["question_ko"],
            "correctAnswers": [],
            "wrongAnswers": []
        }
        
        # 정답 처리
        for correct in item["correctAnswers"]:
            korean_item["correctAnswers"].append({
                "text": correct["text_ko"],
                "rationale": correct["rationale_ko"]
            })
        
        # 오답 처리
        for wrong in item["wrongAnswers"]:
            korean_item["wrongAnswers"].append({
                "text": wrong["text_ko"],
                "rationale": wrong["rationale_ko"]
            })
        
        korean_data.append(korean_item)
    
    with open('data/interview_questions_ko.json', 'w', encoding='utf-8') as f:
        json.dump(korean_data, f, ensure_ascii=False, indent=2)
    
    print("✅ 한국어 번역 파일 생성 완료: interview_questions_ko.json")
    
    # 3. 영어 번역 파일 생성
    english_data = []
    for item in original_data:
        english_item = {
            "id": item["id"],
            "question": item["question_en"],
            "correctAnswers": [],
            "wrongAnswers": []
        }
        
        # 정답 처리
        for correct in item["correctAnswers"]:
            english_item["correctAnswers"].append({
                "text": correct["text_en"],
                "rationale": correct["rationale_en"]
            })
        
        # 오답 처리
        for wrong in item["wrongAnswers"]:
            english_item["wrongAnswers"].append({
                "text": wrong["text_en"],
                "rationale": wrong["rationale_en"]
            })
        
        english_data.append(english_item)
    
    with open('data/interview_questions_en.json', 'w', encoding='utf-8') as f:
        json.dump(english_data, f, ensure_ascii=False, indent=2)
    
    print("✅ 영어 번역 파일 생성 완료: interview_questions_en.json")
    
    # 4. 기존 언어별 파일들 리팩토링
    languages = [
        ('es', 'interview_questions_es.json'),
        ('zh', 'interview_questions_zh.json'),
        ('tl', 'interview_questions_tl.json'),
        ('vi', 'interview_questions_vi.json'),
        ('hi', 'interview_questions_hi.json'),
        ('fr', 'interview_questions_fr.json'),
        ('ar', 'interview_questions_ar.json')
    ]
    
    for lang_code, filename in languages:
        filepath = f'data/{filename}'
        if os.path.exists(filepath):
            print(f"\n🔄 {lang_code.upper()} 파일 리팩토링 중...")
            
            with open(filepath, 'r', encoding='utf-8') as f:
                lang_data = json.load(f)
            
            # 새로운 구조로 변환
            refactored_data = []
            for item in lang_data:
                refactored_item = {
                    "id": item["id"],
                    "question": item[f"question_{lang_code}"],
                    "correctAnswers": [],
                    "wrongAnswers": []
                }
                
                # 정답 처리
                for correct in item["correctAnswers"]:
                    refactored_item["correctAnswers"].append({
                        "text": correct[f"text_{lang_code}"],
                        "rationale": correct[f"rationale_{lang_code}"]
                    })
                
                # 오답 처리
                for wrong in item["wrongAnswers"]:
                    refactored_item["wrongAnswers"].append({
                        "text": wrong[f"text_{lang_code}"],
                        "rationale": wrong[f"rationale_{lang_code}"]
                    })
                
                refactored_data.append(refactored_item)
            
            # 새로운 구조로 저장
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(refactored_data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ {lang_code.upper()} 파일 리팩토링 완료: {len(refactored_data)}개 질문")
        else:
            print(f"⚠️  {filename} 파일이 존재하지 않습니다.")
    
    print("\n🎉 모든 파일 리팩토링 완료!")
    print("\n📁 새로운 파일 구조:")
    print("├── interview_questions_base.json    # 기본 메타데이터")
    print("├── interview_questions_ko.json      # 한국어")
    print("├── interview_questions_en.json      # 영어")
    print("├── interview_questions_es.json      # 스페인어")
    print("├── interview_questions_zh.json      # 중국어")
    print("├── interview_questions_tl.json      # 필리핀어")
    print("├── interview_questions_vi.json      # 베트남어")
    print("├── interview_questions_hi.json      # 힌디어")
    print("├── interview_questions_fr.json      # 프랑스어")
    print("└── interview_questions_ar.json      # 아랍어")
    
    # 파일 크기 확인
    print("\n📊 파일 크기 비교:")
    for lang_code, filename in [('base', 'interview_questions_base.json')] + [('ko', 'interview_questions_ko.json'), ('en', 'interview_questions_en.json')] + languages:
        filepath = f'data/{filename}'
        if os.path.exists(filepath):
            size = os.path.getsize(filepath)
            print(f"{lang_code.upper():>4}: {size:>8} bytes ({size/1024:.1f} KB)")

if __name__ == "__main__":
    refactor_questions_structure()

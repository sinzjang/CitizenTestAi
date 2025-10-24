#!/usr/bin/env python3
import json
import os
from typing import List, Dict

# 다중 정답 질문 ID 목록
MULTIPLE_ANSWER_QUESTIONS = [
    2, 4, 6, 11, 12, 13, 14, 36, 37, 41, 42, 48, 49, 50, 51, 52, 53, 55, 57, 58, 
    59, 61, 64, 67, 68, 72, 73, 74, 75, 76, 77, 78, 85, 87, 88, 91, 92, 93, 95, 100
]

# 언어 파일 매핑 (중국어 제외)
LANGUAGE_FILES = {
    'en': 'interview_questions_en.json',
    'ko': 'interview_questions_ko.json', 
    'es': 'interview_questions_es.json',
    'tl': 'interview_questions_tl.json',
    'vi': 'interview_questions_vi.json',
    'hi': 'interview_questions_hi.json',
    'fr': 'interview_questions_fr.json',
    'ar': 'interview_questions_ar.json'
}

def load_json_file(file_path: str) -> List[Dict]:
    """JSON 파일 로드"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json_file(file_path: str, data: List[Dict]):
    """JSON 파일 저장"""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def combine_wrong_answers(wrong_answers: List[Dict]) -> List[Dict]:
    """기존 3개 오답을 3개 결합된 오답으로 변환"""
    if len(wrong_answers) < 3:
        return wrong_answers
    
    # 첫 번째 결합: 기존 3개 오답 결합
    combined_text_1 = ", ".join([ans["text"] for ans in wrong_answers[:3]])
    combined_rationale_1 = " ".join([ans["rationale"] for ans in wrong_answers[:3]])
    
    # 두 번째와 세 번째는 임시로 기존 구조 유지 (수동 번역 필요)
    return [
        {
            "text": combined_text_1,
            "rationale": combined_rationale_1
        },
        wrong_answers[1] if len(wrong_answers) > 1 else wrong_answers[0],
        wrong_answers[2] if len(wrong_answers) > 2 else wrong_answers[0]
    ]

def update_question_wrong_answers(data: List[Dict], question_ids: List[int]) -> List[Dict]:
    """지정된 질문들의 wrongAnswers 업데이트"""
    updated_data = data.copy()
    
    for question in updated_data:
        if question.get('id') in question_ids:
            if 'wrongAnswers' in question:
                question['wrongAnswers'] = combine_wrong_answers(question['wrongAnswers'])
                print(f"Updated question {question['id']}: {question.get('question', '')[:50]}...")
    
    return updated_data

def main():
    """메인 실행 함수"""
    data_dir = "/Users/seshin/Desktop/Personal/Private_Projects/CitizenTestAi/data"
    
    print("🚀 다중 정답 질문 wrongAnswers 일괄 업데이트 시작...")
    print(f"대상 질문: {len(MULTIPLE_ANSWER_QUESTIONS)}개")
    print(f"대상 언어: {len(LANGUAGE_FILES)}개")
    print()
    
    for lang_code, filename in LANGUAGE_FILES.items():
        file_path = os.path.join(data_dir, filename)
        
        if not os.path.exists(file_path):
            print(f"❌ 파일 없음: {filename}")
            continue
            
        print(f"📝 처리 중: {filename} ({lang_code})")
        
        try:
            # 파일 로드
            data = load_json_file(file_path)
            
            # wrongAnswers 업데이트 (영어만 자동, 나머지는 수동 번역 필요)
            if lang_code == 'en':
                updated_data = update_question_wrong_answers(data, MULTIPLE_ANSWER_QUESTIONS)
                
                # 백업 생성
                backup_path = file_path.replace('.json', '_backup.json')
                save_json_file(backup_path, data)
                print(f"  💾 백업 생성: {backup_path}")
                
                # 업데이트된 파일 저장
                save_json_file(file_path, updated_data)
                print(f"  ✅ 업데이트 완료: {filename}")
            else:
                print(f"  ⏳ 수동 번역 필요: {filename}")
                
        except Exception as e:
            print(f"  ❌ 오류 발생: {e}")
        
        print()
    
    print("🎉 일괄 업데이트 완료!")
    print("\n📋 다음 단계:")
    print("1. 영어 파일의 업데이트된 구조 확인")
    print("2. 각 언어별로 수동 번역 및 문화적 맥락 적용")
    print("3. 질문별로 개별 프롬프트 사용하여 정확한 번역")

if __name__ == "__main__":
    main()

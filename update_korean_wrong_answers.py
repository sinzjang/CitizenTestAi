#!/usr/bin/env python3
"""
Script to update Korean wrongAnswers based on updated English wrongAnswers
"""

import json
import re

# Questions that need to be updated with their correct answer counts
QUESTIONS_TO_UPDATE = {
    # 5 correct answers (5 wrong answers each)
    6: 5, 78: 5, 91: 5,
    
    # 4 correct answers (4 wrong answers each)  
    36: 4, 41: 4, 48: 4, 51: 4, 55: 4, 64: 4, 72: 4, 87: 4, 92: 4, 93: 4, 100: 4,
    
    # 3 correct answers (3 wrong answers each)
    2: 3, 12: 3, 13: 3, 37: 3, 42: 3, 53: 3, 58: 3, 61: 3, 67: 3, 68: 3, 74: 3, 75: 3,
    
    # 2 correct answers (2 wrong answers each)
    4: 2, 11: 2, 14: 2, 49: 2, 50: 2, 52: 2, 57: 2, 59: 2, 73: 2, 76: 2, 77: 2, 85: 2, 88: 2, 95: 2
}

# Korean translations for common terms
TRANSLATIONS = {
    # Government and Politics
    "President": "대통령",
    "Congress": "의회", 
    "Senate": "상원",
    "House of Representatives": "하원",
    "Supreme Court": "대법원",
    "Constitution": "헌법",
    "Bill of Rights": "권리장전",
    "Amendment": "수정안",
    "Cabinet": "내각",
    "Secretary of": "장관",
    "Chief Justice": "대법원장",
    "Speaker of the House": "하원의장",
    "Vice President": "부통령",
    
    # Rights and Freedoms
    "freedom of religion": "종교의 자유",
    "freedom of speech": "언론의 자유", 
    "freedom of assembly": "집회의 자유",
    "freedom of the press": "출판의 자유",
    "freedom to petition": "청원의 자유",
    "right to vote": "투표할 권리",
    "right to bear arms": "무기를 소지할 권리",
    "due process": "적법 절차",
    "equal protection": "평등 보호",
    "privacy": "사생활",
    "trial by jury": "배심원 재판",
    "right to counsel": "변호사 선임권",
    "speedy trial": "신속한 재판",
    
    # Wars and History
    "World War I": "제1차 세계대전",
    "World War II": "제2차 세계대전", 
    "Korean War": "한국전쟁",
    "Vietnam War": "베트남 전쟁",
    "Gulf War": "걸프 전쟁",
    "Civil War": "남북전쟁",
    "Revolutionary War": "독립전쟁",
    "War of 1812": "1812년 전쟁",
    
    # Geography
    "Puerto Rico": "푸에르토리코",
    "Guam": "괌",
    "U.S. Virgin Islands": "미국령 버진아일랜드",
    "American Samoa": "아메리칸 사모아",
    "Northern Mariana Islands": "북마리아나 제도",
    "California": "캘리포니아",
    "Texas": "텍사스",
    "New Mexico": "뉴멕시코",
    "Arizona": "애리조나",
    "Florida": "플로리다",
    
    # People
    "Abraham Lincoln": "에이브러햄 링컨",
    "George Washington": "조지 워싱턴",
    "Thomas Jefferson": "토머스 제퍼슨",
    "Benjamin Franklin": "벤자민 프랭클린",
    "Martin Luther King Jr.": "마틴 루터 킹 주니어",
    "Susan B. Anthony": "수잔 B. 앤서니",
    
    # Common phrases
    "Correct.": "정답입니다.",
    "This is incorrect because": "이것은 틀렸습니다. 왜냐하면",
    "These are": "이것들은",
    "This refers to": "이것은 다음을 의미합니다",
}

def load_json_file(filepath):
    """Load JSON file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json_file(data, filepath):
    """Save JSON file with proper formatting"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def find_question_by_id(questions, question_id):
    """Find question by ID"""
    for question in questions:
        if question['id'] == question_id:
            return question
    return None

def basic_translate(text):
    """Basic translation using the translation dictionary"""
    translated = text
    for en, ko in TRANSLATIONS.items():
        translated = translated.replace(en, ko)
    return translated

def main():
    # Load files
    print("Loading English and Korean question files...")
    en_questions = load_json_file('/Users/seshin/Desktop/Personal/Private_Projects/CitizenTestAi/data/interview_questions_en.json')
    ko_questions = load_json_file('/Users/seshin/Desktop/Personal/Private_Projects/CitizenTestAi/data/interview_questions_ko.json')
    
    updated_count = 0
    
    for question_id, expected_count in QUESTIONS_TO_UPDATE.items():
        print(f"Processing question {question_id} (expecting {expected_count} wrong answers each)...")
        
        # Find questions in both files
        en_question = find_question_by_id(en_questions, question_id)
        ko_question = find_question_by_id(ko_questions, question_id)
        
        if not en_question or not ko_question:
            print(f"  Warning: Question {question_id} not found in one of the files")
            continue
            
        # Skip question 6 as it's already updated
        if question_id == 6:
            print(f"  Question {question_id} already updated, skipping...")
            continue
            
        # Check if English question has the expected format
        en_wrong_answers = en_question.get('wrongAnswers', [])
        if not en_wrong_answers:
            print(f"  Warning: No wrong answers found for question {question_id}")
            continue
            
        # Verify the first wrong answer has the expected number of comma-separated items
        first_wrong_text = en_wrong_answers[0].get('text', '')
        comma_count = first_wrong_text.count(',')
        actual_count = comma_count + 1 if first_wrong_text.strip() else 0
        
        if actual_count != expected_count:
            print(f"  Warning: Question {question_id} has {actual_count} wrong answers, expected {expected_count}")
            continue
            
        print(f"  Question {question_id}: Found {len(en_wrong_answers)} wrong answer entries with {actual_count} items each")
        
        # For now, just print what we would translate (manual review needed)
        print(f"  English wrong answers to translate:")
        for i, wrong_answer in enumerate(en_wrong_answers):
            print(f"    {i+1}. Text: {wrong_answer['text']}")
            print(f"       Rationale: {wrong_answer['rationale'][:100]}...")
        
        updated_count += 1
    
    print(f"\nProcessed {updated_count} questions that need translation updates.")
    print("Manual translation and review required for accuracy.")

if __name__ == "__main__":
    main()

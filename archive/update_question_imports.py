#!/usr/bin/env python3
"""
모든 파일에서 이전 interview_questions.json 사용을 새로운 QuestionLoader로 업데이트하는 스크립트
"""

import os
import re

# 업데이트할 파일들과 패턴
files_to_update = [
    "utils/progressTracker.js",
    "screens/StoryMode.js", 
    "screens/AllQuestionsScreen.js",
    "screens/ListView.js",
    "screens/FlashcardMode.js",
    "screens/AudioMode.js",
    "screens/WeaknessTestScreen.js"
]

def update_file(file_path):
    """파일을 업데이트하여 새로운 QuestionLoader를 사용하도록 수정"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 1. QuestionLoader import 추가 (이미 있는지 확인)
        if "import QuestionLoader from" not in content:
            # import 섹션 찾기
            import_pattern = r"(import.*?from.*?;)\n"
            imports = re.findall(import_pattern, content)
            if imports:
                # 마지막 import 뒤에 QuestionLoader import 추가
                last_import = imports[-1]
                content = content.replace(
                    last_import,
                    last_import + "\nimport QuestionLoader from '../utils/questionLoader';"
                )
        
        # 2. require('../data/interview_questions.json') 패턴을 QuestionLoader.loadQuestions()로 변경
        patterns_to_replace = [
            # 기본 패턴
            (r"const questionsData = require\('\.\./data/interview_questions\.json'\);",
             "const questionsData = await QuestionLoader.loadQuestions();"),
            
            # 다른 변수명 패턴
            (r"const allQuestionsData = require\('\.\./data/interview_questions\.json'\);",
             "const allQuestionsData = await QuestionLoader.loadQuestions();"),
            
            # 직접 require 패턴
            (r"require\('\.\./data/interview_questions\.json'\)",
             "await QuestionLoader.loadQuestions()"),
        ]
        
        for pattern, replacement in patterns_to_replace:
            content = re.sub(pattern, replacement, content)
        
        # 3. 함수를 async로 만들어야 하는 경우 확인
        if "await QuestionLoader.loadQuestions()" in content:
            # loadQuestions 함수를 async로 변경
            content = re.sub(
                r"const loadQuestions = \(\) => \{",
                "const loadQuestions = async () => {",
                content
            )
            
            # 다른 함수 패턴들도 확인
            content = re.sub(
                r"const loadData = \(\) => \{",
                "const loadData = async () => {",
                content
            )
            
            content = re.sub(
                r"const initializeQuestions = \(\) => \{",
                "const initializeQuestions = async () => {",
                content
            )
        
        # 4. 질문 데이터 접근 패턴 업데이트 (새로운 구조에 맞게)
        # question_en -> question, correctAnswers[0].text_en -> correctAnswers[0].text 등
        field_mappings = [
            (r"question_en", "question"),
            (r"question_ko", "question"),
            (r"\.text_en", ".text"),
            (r"\.text_ko", ".text"),
            (r"\.rationale_en", ".rationale"),
            (r"\.rationale_ko", ".rationale"),
        ]
        
        for old_field, new_field in field_mappings:
            content = re.sub(old_field, new_field, content)
        
        # 변경사항이 있으면 파일 저장
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Updated {file_path}")
            return True
        else:
            print(f"ℹ️  No changes needed for {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ Error updating {file_path}: {e}")
        return False

def main():
    """메인 함수"""
    print("🔄 Updating files to use new QuestionLoader...")
    
    updated_count = 0
    
    for file_path in files_to_update:
        if os.path.exists(file_path):
            print(f"\nProcessing {file_path}...")
            if update_file(file_path):
                updated_count += 1
        else:
            print(f"⚠️  File not found: {file_path}")
    
    print(f"\n🎉 Update completed! {updated_count} files were updated.")
    print("\n📝 Note: You may need to manually review and adjust some files for:")
    print("   - Async/await patterns")
    print("   - Error handling")
    print("   - Component state updates")

if __name__ == "__main__":
    main()
